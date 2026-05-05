"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireClubBySlug } from "../tenancy/tenantService";
import { requireClubAdminForClub } from "../auth/adminAccessGuards";
import prisma from "../db/prisma";
import { PublicSurfaceVisibility } from "../../generated/prisma";
import sanitizeHtml from "sanitize-html";

function parsePublicSurfaceVisibility(value: FormDataEntryValue | null): PublicSurfaceVisibility {
  return value === PublicSurfaceVisibility.MEMBERS_ONLY
    ? PublicSurfaceVisibility.MEMBERS_ONLY
    : PublicSurfaceVisibility.PUBLIC;
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "b", "em", "i", "ul", "ol", "li", "blockquote", "br", "a", "img", "div", "span"
  ],
  allowedAttributes: {
    "a": ["href", "target", "rel"],
    "img": ["src", "alt", "title", "width", "height"],
    "*": ["class"]
  },
  transformTags: {
    "a": (tagName, attribs) => {
      return {
        tagName: "a",
        attribs: {
          ...attribs,
          rel: "noopener noreferrer",
          target: "_blank"
        }
      };
    }
  }
};

export async function createCalendarEntryAction(clubSlug: string, formData: FormData) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug);

  const title = formData.get("title") as string;
  const rawDescription = formData.get("descriptionHtml") as string;
  const dateStr = formData.get("date") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const location = formData.get("location") as string;
  const isPublished = formData.get("isPublished") === "true";
  const visibility = parsePublicSurfaceVisibility(formData.get("visibility"));
  const forceShowInMarquee = formData.get("forceShowInMarquee") === "true";
  const repeatWeekly = formData.get("repeatWeekly") === "true";
  const repeatCountValue = Number(formData.get("repeatCount") || "1");

  if (!title || !dateStr) {
    throw new Error("Titel og dato er påkrævet");
  }

  if (repeatWeekly && (!Number.isInteger(repeatCountValue) || repeatCountValue < 1 || repeatCountValue > 104)) {
    throw new Error("Antal forekomster skal være mellem 1 og 104");
  }

  const occurrenceCount = repeatWeekly ? repeatCountValue : 1;

  const startsAt = new Date(dateStr);
  if (startTime) {
    const [hours, minutes] = startTime.split(":").map(Number);
    startsAt.setHours(hours, minutes, 0, 0);
  }

  let endsAt: Date | null = null;
  if (endTime) {
    endsAt = new Date(dateStr);
    const [hours, minutes] = endTime.split(":").map(Number);
    endsAt.setHours(hours, minutes, 0, 0);
  }

  const descriptionHtml = rawDescription ? sanitizeHtml(rawDescription, SANITIZE_OPTIONS) : null;

  const entries = Array.from({ length: occurrenceCount }, (_, index) => {
    const occurrenceStartsAt = new Date(startsAt);
    occurrenceStartsAt.setDate(startsAt.getDate() + index * 7);

    const occurrenceEndsAt = endsAt ? new Date(endsAt) : null;
    if (occurrenceEndsAt) {
      occurrenceEndsAt.setDate(occurrenceEndsAt.getDate() + index * 7);
    }

    return {
      clubId: club.id,
      title,
      descriptionHtml,
      startsAt: occurrenceStartsAt,
      endsAt: occurrenceEndsAt,
      location,
      isPublished,
      visibility,
      forceShowInMarquee,
    };
  });

  await prisma.clubCalendarEntry.createMany({
    data: entries,
  });

  revalidatePath(`/${clubSlug}/admin/kalender`);
  revalidatePath(`/${clubSlug}/kalender`);
  revalidatePath(`/${clubSlug}`);
  redirect(`/${clubSlug}/admin/kalender`);
}

export async function updateCalendarEntryAction(clubSlug: string, entryId: string, formData: FormData) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug);

  const title = formData.get("title") as string;
  const rawDescription = formData.get("descriptionHtml") as string;
  const dateStr = formData.get("date") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const location = formData.get("location") as string;
  const isPublished = formData.get("isPublished") === "true";
  const visibility = parsePublicSurfaceVisibility(formData.get("visibility"));
  const forceShowInMarquee = formData.get("forceShowInMarquee") === "true";

  if (!title || !dateStr) {
    throw new Error("Titel og dato er påkrævet");
  }

  const startsAt = new Date(dateStr);
  if (startTime) {
    const [hours, minutes] = startTime.split(":").map(Number);
    startsAt.setHours(hours, minutes, 0, 0);
  }

  let endsAt: Date | null = null;
  if (endTime) {
    endsAt = new Date(dateStr);
    const [hours, minutes] = endTime.split(":").map(Number);
    endsAt.setHours(hours, minutes, 0, 0);
  }

  const descriptionHtml = rawDescription ? sanitizeHtml(rawDescription, SANITIZE_OPTIONS) : null;

  await prisma.clubCalendarEntry.update({
    where: { id: entryId, clubId: club.id },
    data: {
      title,
      descriptionHtml,
      startsAt,
      endsAt,
      location,
      isPublished,
      visibility,
      forceShowInMarquee,
    },
  });

  revalidatePath(`/${clubSlug}/admin/kalender`);
  revalidatePath(`/${clubSlug}`);
  revalidatePath(`/${clubSlug}/kalender/${entryId}`);
  redirect(`/${clubSlug}/admin/kalender`);
}

export async function deleteCalendarEntryAction(clubSlug: string, entryId: string) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug);

  await prisma.clubCalendarEntry.delete({
    where: { id: entryId, clubId: club.id },
  });

  revalidatePath(`/${clubSlug}/admin/kalender`);
  revalidatePath(`/${clubSlug}`);
}

export async function toggleCalendarEntryPublishedAction(clubSlug: string, entryId: string, isPublished: boolean) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug);

  await prisma.clubCalendarEntry.update({
    where: { id: entryId, clubId: club.id },
    data: { isPublished },
  });

  revalidatePath(`/${clubSlug}/admin/kalender`);
  revalidatePath(`/${clubSlug}`);
}
