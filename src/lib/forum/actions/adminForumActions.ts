"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "../../db/prisma";
import { requireClubAdminForClub } from "../../auth/adminAccessGuards";
import { requireClubBySlug } from "../../tenancy/tenantService";

export async function createForumCategory(clubSlug: string, formData: FormData) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug);

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const slug = formData.get("slug") as string;
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;
  const isActive = formData.get("isActive") === "on";

  if (!title || !slug) {
    throw new Error("Titel og slug er påkrævet");
  }

  await prisma.clubForumCategory.create({
    data: {
      clubId: club.id,
      title,
      description,
      slug,
      sortOrder,
      isActive,
    },
  });

  revalidatePath(`/${clubSlug}/admin/forum`);
  redirect(`/${clubSlug}/admin/forum`);
}

export async function updateForumCategory(clubSlug: string, categoryId: string, formData: FormData) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug);

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const slug = formData.get("slug") as string;
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;
  const isActive = formData.get("isActive") === "on";

  if (!title || !slug) {
    throw new Error("Titel og slug er påkrævet");
  }

  await prisma.clubForumCategory.update({
    where: { id: categoryId },
    data: {
      title,
      description,
      slug,
      sortOrder,
      isActive,
    },
  });

  revalidatePath(`/${clubSlug}/admin/forum`);
  redirect(`/${clubSlug}/admin/forum`);
}
