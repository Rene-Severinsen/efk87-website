"use server";

import { revalidatePath } from "next/cache";
import { requireClubBySlug } from "../tenancy/tenantService";
import { requireClubAdminForClub } from "../auth/adminAccessGuards";
import prisma from "../db/prisma";

function normalizeTagName(value: FormDataEntryValue | null): string {
  return value?.toString().trim() || "";
}

function createSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeSlug(value: FormDataEntryValue | null, fallbackName: string): string {
  const rawValue = value?.toString().trim() || "";
  return createSlug(rawValue || fallbackName);
}

async function requireArticleTagAdmin(clubSlug: string) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/artikler/tags`);
  return club;
}

async function isArticleTagSlugAvailable(clubId: string, slug: string, excludeId?: string): Promise<boolean> {
  const existingTag = await prisma.articleTag.findFirst({
    where: {
      clubId,
      slug,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });

  return !existingTag;
}

export async function createArticleTagAction(clubSlug: string, formData: FormData) {
  const club = await requireArticleTagAdmin(clubSlug);

  const name = normalizeTagName(formData.get("name"));
  const slug = normalizeSlug(formData.get("slug"), name);

  if (!name) {
    throw new Error("Tag-navn er påkrævet.");
  }

  if (!slug) {
    throw new Error("Slug kunne ikke dannes.");
  }

  const isSlugAvailable = await isArticleTagSlugAvailable(club.id, slug);

  if (!isSlugAvailable) {
    revalidatePath(`/${clubSlug}/admin/artikler/tags`);
    return;
  }

  await prisma.articleTag.create({
    data: {
      clubId: club.id,
      name,
      slug,
    },
  });

  revalidatePath(`/${clubSlug}/admin/artikler`);
  revalidatePath(`/${clubSlug}/admin/artikler/tags`);
  revalidatePath(`/${clubSlug}/artikler`);
}

export async function updateArticleTagAction(clubSlug: string, tagId: string, formData: FormData) {
  const club = await requireArticleTagAdmin(clubSlug);

  const name = normalizeTagName(formData.get("name"));
  const slug = normalizeSlug(formData.get("slug"), name);

  if (!name) {
    throw new Error("Tag-navn er påkrævet.");
  }

  if (!slug) {
    throw new Error("Slug kunne ikke dannes.");
  }

  const existingTag = await prisma.articleTag.findFirst({
    where: {
      id: tagId,
      clubId: club.id,
    },
    select: { id: true },
  });

  if (!existingTag) {
    throw new Error("Tag blev ikke fundet.");
  }

  const isSlugAvailable = await isArticleTagSlugAvailable(club.id, slug, tagId);

  if (!isSlugAvailable) {
    revalidatePath(`/${clubSlug}/admin/artikler/tags`);
    return;
  }

  await prisma.articleTag.update({
    where: { id: tagId },
    data: {
      name,
      slug,
    },
  });

  revalidatePath(`/${clubSlug}/admin/artikler`);
  revalidatePath(`/${clubSlug}/admin/artikler/tags`);
  revalidatePath(`/${clubSlug}/artikler`);
}

export async function deleteArticleTagAction(clubSlug: string, tagId: string) {
  const club = await requireArticleTagAdmin(clubSlug);

  const tag = await prisma.articleTag.findFirst({
    where: {
      id: tagId,
      clubId: club.id,
    },
    select: {
      id: true,
      _count: {
        select: {
          articles: true,
        },
      },
    },
  });

  if (!tag) {
    throw new Error("Tag blev ikke fundet.");
  }

  if (tag._count.articles > 0) {
    throw new Error("Tagget kan ikke slettes, fordi det bruges på en eller flere artikler.");
  }

  await prisma.articleTag.delete({
    where: { id: tagId },
  });

  revalidatePath(`/${clubSlug}/admin/artikler`);
  revalidatePath(`/${clubSlug}/admin/artikler/tags`);
  revalidatePath(`/${clubSlug}/artikler`);
}
