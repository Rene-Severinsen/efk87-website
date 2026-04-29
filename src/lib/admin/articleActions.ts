"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireClubBySlug } from "../tenancy/tenantService";
import { requireClubAdminForClub } from "../auth/adminAccessGuards";
import prisma from "../db/prisma";
import { ArticleStatus, PublicSurfaceVisibility } from "../../generated/prisma";
import { normalizeClubSlug } from "../tenancy/tenantParams";

export async function createArticleAction(clubSlug: string, formData: FormData) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug);

  const title = formData.get("title") as string;
  const rawSlug = formData.get("slug") as string;
  const excerpt = formData.get("excerpt") as string;
  const body = formData.get("body") as string;
  const heroImageUrl = formData.get("heroImageUrl") as string;
  const authorName = formData.get("authorName") as string;
  const categoryId = formData.get("categoryId") as string;
  const status = formData.get("status") as ArticleStatus;
  const visibility = formData.get("visibility") as PublicSurfaceVisibility;
  const isFeatured = formData.get("isFeatured") === "true";
  const readingMinutes = formData.get("readingMinutes") ? parseInt(formData.get("readingMinutes") as string, 10) : null;
  const tagIds = formData.getAll("tagIds") as string[];

  // Validation
  if (!title || !rawSlug || !body) {
    throw new Error("Title, slug, and body are required");
  }

  const slug = normalizeClubSlug(rawSlug);
  if (!slug) {
    throw new Error("Invalid slug");
  }

  // Check for duplicate slug
  const existing = await prisma.article.findUnique({
    where: {
      clubId_slug: {
        clubId: club.id,
        slug,
      },
    },
  });

  if (existing) {
    throw new Error("Slug already in use");
  }

  const publishedAt = status === ArticleStatus.PUBLISHED ? new Date() : null;

  await prisma.article.create({
    data: {
      clubId: club.id,
      title,
      slug,
      excerpt,
      body,
      heroImageUrl,
      authorName,
      categoryId: categoryId || null,
      status,
      visibility,
      isFeatured,
      readingMinutes,
      publishedAt,
      tags: {
        create: tagIds.map((tagId) => ({
          tag: { connect: { id: tagId } },
        })),
      },
    },
  });

  revalidatePath(`/${clubSlug}/admin/artikler`);
  revalidatePath(`/${clubSlug}/artikler`);
  redirect(`/${clubSlug}/admin/artikler`);
}

export async function updateArticleAction(clubSlug: string, articleId: string, formData: FormData) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug);

  const title = formData.get("title") as string;
  const rawSlug = formData.get("slug") as string;
  const excerpt = formData.get("excerpt") as string;
  const body = formData.get("body") as string;
  const heroImageUrl = formData.get("heroImageUrl") as string;
  const authorName = formData.get("authorName") as string;
  const categoryId = formData.get("categoryId") as string;
  const status = formData.get("status") as ArticleStatus;
  const visibility = formData.get("visibility") as PublicSurfaceVisibility;
  const isFeatured = formData.get("isFeatured") === "true";
  const readingMinutes = formData.get("readingMinutes") ? parseInt(formData.get("readingMinutes") as string, 10) : null;
  const tagIds = formData.getAll("tagIds") as string[];

  // Validation
  if (!title || !rawSlug || !body) {
    throw new Error("Title, slug, and body are required");
  }

  const slug = normalizeClubSlug(rawSlug);
  if (!slug) {
    throw new Error("Invalid slug");
  }

  // Check for duplicate slug (excluding current article)
  const existing = await prisma.article.findFirst({
    where: {
      clubId: club.id,
      slug,
      NOT: { id: articleId },
    },
  });

  if (existing) {
    throw new Error("Slug already in use");
  }

  const currentArticle = await prisma.article.findUnique({
    where: { id: articleId },
    select: { status: true, publishedAt: true },
  });

  let publishedAt = currentArticle?.publishedAt;
  if (status === ArticleStatus.PUBLISHED && !publishedAt) {
    publishedAt = new Date();
  }

  await prisma.$transaction(async (tx) => {
    // Update article
    await tx.article.update({
      where: { id: articleId, clubId: club.id },
      data: {
        title,
        slug,
        excerpt,
        body,
        heroImageUrl,
        authorName,
        categoryId: categoryId || null,
        status,
        visibility,
        isFeatured,
        readingMinutes,
        publishedAt,
      },
    });

    // Update tags
    await tx.articleTagAssignment.deleteMany({
      where: { articleId },
    });

    if (tagIds.length > 0) {
      await tx.articleTagAssignment.createMany({
        data: tagIds.map((tagId) => ({
          articleId,
          tagId,
        })),
      });
    }
  });

  revalidatePath(`/${clubSlug}/admin/artikler`);
  revalidatePath(`/${clubSlug}/artikler`);
  revalidatePath(`/${clubSlug}/artikler/${slug}`);
  redirect(`/${clubSlug}/admin/artikler`);
}
