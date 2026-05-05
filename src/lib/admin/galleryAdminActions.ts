"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  GalleryAlbumStatus,
  GalleryImageStatus,
  PublicSurfaceVisibility,
} from "../../generated/prisma";
import { requireClubAdminForClub } from "../auth/adminAccessGuards";
import prisma from "../db/prisma";
import { requireClubBySlug } from "../tenancy/tenantService";

const galleryUpdateSchema = z.object({
  title: z.string().trim().min(1, "Titel skal udfyldes."),
  description: z.string().trim().optional(),
  status: z.nativeEnum(GalleryAlbumStatus),
  visibility: z.nativeEnum(PublicSurfaceVisibility),
  showOnPublicHomepage: z.boolean(),
  homepageSortOrder: z.coerce.number().int().min(0).max(9999),
});

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getCheckbox(formData: FormData, key: string): boolean {
  return formData.get(key) === "true";
}

function revalidateGalleryPaths(clubSlug: string, albumId?: string) {
  revalidatePath(`/${clubSlug}/admin/galleri`);

  if (albumId) {
    revalidatePath(`/${clubSlug}/admin/galleri/${albumId}`);
  }

  revalidatePath(`/${clubSlug}/galleri`);
  revalidatePath(`/${clubSlug}`);
}

export async function updateAdminGalleryAction(
  clubSlug: string,
  albumId: string,
  formData: FormData,
) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(
    club.id,
    clubSlug,
    `/${clubSlug}/admin/galleri/${albumId}`,
  );

  const parsed = galleryUpdateSchema.safeParse({
    title: getText(formData, "title"),
    description: getText(formData, "description"),
    status: getText(formData, "status"),
    visibility: getText(formData, "visibility"),
    showOnPublicHomepage: getCheckbox(formData, "showOnPublicHomepage"),
    homepageSortOrder: getText(formData, "homepageSortOrder") || "0",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Galleriet kunne ikke gemmes.");
  }

  await prisma.galleryAlbum.updateMany({
    where: {
      id: albumId,
      clubId: club.id,
    },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status,
      visibility: parsed.data.visibility,
      showOnPublicHomepage: parsed.data.showOnPublicHomepage,
      homepageSortOrder: parsed.data.homepageSortOrder,
    },
  });

  revalidateGalleryPaths(clubSlug, albumId);
  redirect(`/${clubSlug}/admin/galleri/${albumId}?saved=1`);
}

export async function archiveGalleryAdminAction(
  clubSlug: string,
  albumId: string,
) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(
    club.id,
    clubSlug,
    `/${clubSlug}/admin/galleri`,
  );

  await prisma.galleryAlbum.updateMany({
    where: {
      id: albumId,
      clubId: club.id,
    },
    data: {
      status: GalleryAlbumStatus.ARCHIVED,
    },
  });

  revalidateGalleryPaths(clubSlug, albumId);
  redirect(`/${clubSlug}/admin/galleri?saved=deleted`);
}

export async function hideGalleryImageAdminAction(
  clubSlug: string,
  albumId: string,
  imageId: string,
) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(
    club.id,
    clubSlug,
    `/${clubSlug}/admin/galleri/${albumId}`,
  );

  await prisma.galleryImage.updateMany({
    where: {
      id: imageId,
      clubId: club.id,
      albumId,
    },
    data: {
      status: GalleryImageStatus.HIDDEN,
    },
  });

  const firstActiveImage = await prisma.galleryImage.findFirst({
    where: {
      clubId: club.id,
      albumId,
      status: GalleryImageStatus.ACTIVE,
    },
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "asc" },
    ],
    select: {
      imageUrl: true,
    },
  });

  await prisma.galleryAlbum.updateMany({
    where: {
      id: albumId,
      clubId: club.id,
    },
    data: {
      coverImageUrl: firstActiveImage?.imageUrl || null,
    },
  });

  revalidateGalleryPaths(clubSlug, albumId);
  redirect(`/${clubSlug}/admin/galleri/${albumId}?saved=1`);
}

export async function showGalleryImageAdminAction(
  clubSlug: string,
  albumId: string,
  imageId: string,
) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(
    club.id,
    clubSlug,
    `/${clubSlug}/admin/galleri/${albumId}`,
  );

  await prisma.galleryImage.updateMany({
    where: {
      id: imageId,
      clubId: club.id,
      albumId,
    },
    data: {
      status: GalleryImageStatus.ACTIVE,
    },
  });

  const album = await prisma.galleryAlbum.findFirst({
    where: {
      id: albumId,
      clubId: club.id,
    },
    select: {
      coverImageUrl: true,
    },
  });

  if (!album?.coverImageUrl) {
    const image = await prisma.galleryImage.findFirst({
      where: {
        id: imageId,
        clubId: club.id,
        albumId,
      },
      select: {
        imageUrl: true,
      },
    });

    if (image?.imageUrl) {
      await prisma.galleryAlbum.updateMany({
        where: {
          id: albumId,
          clubId: club.id,
        },
        data: {
          coverImageUrl: image.imageUrl,
        },
      });
    }
  }

  revalidateGalleryPaths(clubSlug, albumId);
  redirect(`/${clubSlug}/admin/galleri/${albumId}?saved=1`);
}

export async function setGalleryCoverImageAdminAction(
  clubSlug: string,
  albumId: string,
  imageUrl: string,
) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(
    club.id,
    clubSlug,
    `/${clubSlug}/admin/galleri/${albumId}`,
  );

  await prisma.galleryAlbum.updateMany({
    where: {
      id: albumId,
      clubId: club.id,
    },
    data: {
      coverImageUrl: imageUrl,
    },
  });

  revalidateGalleryPaths(clubSlug, albumId);
  redirect(`/${clubSlug}/admin/galleri/${albumId}?saved=1`);
}
