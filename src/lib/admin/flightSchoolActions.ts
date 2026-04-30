"use server";

import { revalidatePath } from "next/cache";
import { requireClubBySlug } from "../tenancy/tenantService";
import { requireClubAdminForClub } from "../auth/adminAccessGuards";
import * as flightSchoolAdminService from "./flightSchoolAdminService";
import sanitizeHtml from "sanitize-html";

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

export async function upsertFlightSchoolPageAction(clubSlug: string, formData: FormData) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug);

  const title = formData.get("title") as string;
  const intro = formData.get("intro") as string;
  const rawContentHtml = formData.get("contentHtml") as string;
  const isPublished = formData.get("isPublished") === "true";

  if (!title) throw new Error("Titel er påkrævet");

  const contentHtml = sanitizeHtml(rawContentHtml, SANITIZE_OPTIONS);

  await flightSchoolAdminService.upsertFlightSchoolPage(club.id, {
    title,
    intro,
    contentHtml,
    isPublished,
  });

  revalidatePath(`/${clubSlug}/admin/flyveskole`);
  revalidatePath(`/${clubSlug}/flyveskole`);
  return { success: true };
}

export async function createFlightSchoolDocumentAction(clubSlug: string, formData: FormData) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug);

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const excerpt = formData.get("excerpt") as string;
  const rawContentHtml = formData.get("contentHtml") as string;
  const sortOrder = parseInt(formData.get("sortOrder") as string || "0", 10);
  const isPublished = formData.get("isPublished") === "true";

  if (!title || !slug) throw new Error("Titel og slug er påkrævet");

  const contentHtml = sanitizeHtml(rawContentHtml, SANITIZE_OPTIONS);

  await flightSchoolAdminService.createFlightSchoolDocument(club.id, {
    title,
    slug,
    excerpt,
    contentHtml,
    sortOrder,
    isPublished,
  });

  revalidatePath(`/${clubSlug}/admin/flyveskole`);
  revalidatePath(`/${clubSlug}/flyveskole`);
  return { success: true };
}

export async function updateFlightSchoolDocumentAction(clubSlug: string, id: string, formData: FormData) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug);

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const excerpt = formData.get("excerpt") as string;
  const rawContentHtml = formData.get("contentHtml") as string;
  const sortOrder = parseInt(formData.get("sortOrder") as string || "0", 10);
  const isPublished = formData.get("isPublished") === "true";

  if (!title || !slug) throw new Error("Titel og slug er påkrævet");

  const contentHtml = sanitizeHtml(rawContentHtml, SANITIZE_OPTIONS);

  await flightSchoolAdminService.updateFlightSchoolDocument(club.id, id, {
    title,
    slug,
    excerpt,
    contentHtml,
    sortOrder,
    isPublished,
  });

  revalidatePath(`/${clubSlug}/admin/flyveskole`);
  revalidatePath(`/${clubSlug}/flyveskole`);
  revalidatePath(`/${clubSlug}/flyveskole/dokumenter/${slug}`);
  return { success: true };
}

export async function deleteFlightSchoolDocumentAction(clubSlug: string, id: string) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug);

  await flightSchoolAdminService.deleteFlightSchoolDocument(club.id, id);

  revalidatePath(`/${clubSlug}/admin/flyveskole`);
  revalidatePath(`/${clubSlug}/flyveskole`);
  return { success: true };
}
