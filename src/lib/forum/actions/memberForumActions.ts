"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "../../db/prisma";
import { getServerViewerForClub } from "../../auth/viewer";
import { requireClubBySlug } from "../../tenancy/tenantService";
import { guessForumThreadIcon } from "../forumHelpers";
import { requireActiveMemberForClub } from "../../auth/accessGuards";
import { notifyCategoryEmailOfNewReply, notifyCategoryEmailOfNewThread, notifyThreadAuthorOfReply } from "../forumNotificationService";

export async function createForumThread(clubSlug: string, categorySlug: string, formData: FormData) {
  const club = await requireClubBySlug(clubSlug);
  const viewer = await getServerViewerForClub(club.id);
  
  if (!viewer.isAuthenticated || !viewer.userId) {
    throw new Error("Du skal være logget ind for at oprette en tråd");
  }

  // Ensure user is an active member
  await requireActiveMemberForClub(club.id, clubSlug);

  const category = await prisma.clubForumCategory.findFirst({
    where: { clubId: club.id, slug: categorySlug }
  });

  if (!category) {
    throw new Error("Kategorien findes ikke");
  }

  const title = formData.get("title") as string;
  const bodyHtml = formData.get("bodyHtml") as string;

  if (!title || !bodyHtml) {
    throw new Error("Titel og indhold er påkrævet");
  }

  // Generate slug
  let slug = title
    .toLowerCase()
    .replace(/[æ]/g, 'ae')
    .replace(/[ø]/g, 'oe')
    .replace(/[å]/g, 'aa')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Check for duplicate slug in category
  const existingThread = await prisma.clubForumThread.findFirst({
    where: { clubId: club.id, categoryId: category.id, slug }
  });

  if (existingThread) {
    slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
  }

  const iconKey = guessForumThreadIcon(title, category.slug);

  const thread = await prisma.clubForumThread.create({
    data: {
      clubId: club.id,
      categoryId: category.id,
      authorUserId: viewer.userId,
      title,
      slug,
      bodyHtml,
      iconKey,
      lastActivityAt: new Date(),
    }
  });

  // Trigger notification (fire and forget, don't block redirect)
  notifyCategoryEmailOfNewThread({
    clubSlug,
    categorySlug,
    threadId: thread.id,
    authorName: viewer.name || "En bruger",
    bodyHtml: thread.bodyHtml
  }).catch(err => console.error("Error in notifyCategoryEmailOfNewThread:", err));

  revalidatePath(`/${clubSlug}/forum/${categorySlug}`);
  redirect(`/${clubSlug}/forum/${categorySlug}/${thread.slug}`);
}

export async function createForumReply(clubSlug: string, categorySlug: string, threadSlug: string, threadId: string, formData: FormData) {
  const club = await requireClubBySlug(clubSlug);
  const viewer = await getServerViewerForClub(club.id);
  
  if (!viewer.isAuthenticated || !viewer.userId) {
    throw new Error("Du skal være logget ind for at skrive et svar");
  }

  // Ensure user is an active member
  await requireActiveMemberForClub(club.id, clubSlug);

  const bodyHtml = formData.get("bodyHtml") as string;

  if (!bodyHtml) {
    throw new Error("Indhold er påkrævet");
  }

  await prisma.$transaction([
    prisma.clubForumReply.create({
      data: {
        clubId: club.id,
        threadId,
        authorUserId: viewer.userId,
        bodyHtml,
      }
    }),
    prisma.clubForumThread.update({
      where: { id: threadId },
      data: {
        replyCount: { increment: 1 },
        lastActivityAt: new Date(),
      }
    })
  ]);

  // Trigger notifications (fire and forget)
  notifyThreadAuthorOfReply({
    clubSlug,
    categorySlug,
    threadId,
    replyAuthorName: viewer.name || "En bruger",
    replyAuthorId: viewer.userId,
    replyBodyHtml: bodyHtml
  }).catch(err => console.error("Error in notifyThreadAuthorOfReply:", err));

  notifyCategoryEmailOfNewReply({
    clubSlug,
    categorySlug,
    threadId,
    replyAuthorName: viewer.name || "En bruger",
    replyBodyHtml: bodyHtml
  }).catch(err => console.error("Error in notifyCategoryEmailOfNewReply:", err));

  revalidatePath(`/${clubSlug}/forum/${categorySlug}/${threadSlug}`);
}
