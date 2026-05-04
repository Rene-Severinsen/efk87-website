import prisma from "../db/prisma";
import {
  GalleryAlbumStatus,
  GalleryImageStatus,
  PublicSurfaceVisibility,
} from "../../generated/prisma";
import { storeGalleryImageFile } from "./galleryImageStorageService";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

async function createUniqueGallerySlug(clubId: string, title: string): Promise<string> {
  const base = slugify(title) || "galleri";
  let candidate = base;
  let counter = 2;

  while (
    await prisma.galleryAlbum.findUnique({
      where: {
        clubId_slug: {
          clubId,
          slug: candidate,
        },
      },
      select: {
        id: true,
      },
    })
  ) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }

  return candidate;
}

function normalizeCoverImageIndex(index: number, fileCount: number): number {
  if (!Number.isFinite(index)) return 0;
  if (index < 0) return 0;
  if (index >= fileCount) return 0;

  return index;
}

export async function createMemberGalleryWithImages({
  clubId,
  clubSlug,
  title,
  description,
  visibility,
  files,
  coverImageIndex,
  memberProfileId,
  memberName,
  memberEmail,
}: {
  clubId: string;
  clubSlug: string;
  title: string;
  description: string | null;
  visibility: PublicSurfaceVisibility;
  files: File[];
  coverImageIndex: number;
  memberProfileId: string;
  memberName: string | null;
  memberEmail: string | null;
}) {
  const trimmedTitle = title.trim();
  const trimmedDescription = description?.trim() || null;

  if (!trimmedTitle) {
    throw new Error("Galleriet skal have et navn.");
  }

  if (files.length === 0) {
    throw new Error("Tilføj mindst ét billede.");
  }

  if (files.length > 40) {
    throw new Error("Du kan maksimalt uploade 40 billeder ad gangen.");
  }

  const slug = await createUniqueGallerySlug(clubId, trimmedTitle);

  const album = await prisma.galleryAlbum.create({
    data: {
      clubId,
      slug,
      title: trimmedTitle,
      description: trimmedDescription,
      status: GalleryAlbumStatus.PUBLISHED,
      visibility,
      publishedAt: new Date(),
      createdByMemberProfileId: memberProfileId,
      createdByName: memberName,
      createdByEmail: memberEmail,
    },
  });

  const storedImages = await Promise.all(
    files.map((file) =>
      storeGalleryImageFile({
        clubSlug,
        albumId: album.id,
        file,
      }),
    ),
  );

  await prisma.galleryImage.createMany({
    data: storedImages.map((storedImage, index) => ({
      clubId,
      albumId: album.id,
      title: null,
      caption: null,
      imageUrl: storedImage.publicUrl,
      thumbnailUrl: storedImage.publicUrl,
      originalName: storedImage.originalName,
      fileName: storedImage.fileName,
      mimeType: storedImage.mimeType,
      sizeBytes: storedImage.sizeBytes,
      storageProvider: storedImage.storageProvider,
      storageKey: storedImage.storageKey,
      sortOrder: index * 10,
      status: GalleryImageStatus.ACTIVE,
      uploadedAt: new Date(),
      uploadedByMemberProfileId: memberProfileId,
      uploadedByName: memberName,
      uploadedByEmail: memberEmail,
    })),
  });

  const normalizedCoverIndex = normalizeCoverImageIndex(coverImageIndex, storedImages.length);
  const coverImageUrl = storedImages[normalizedCoverIndex]?.publicUrl ?? storedImages[0]?.publicUrl ?? null;

  if (coverImageUrl) {
    await prisma.galleryAlbum.update({
      where: {
        id: album.id,
      },
      data: {
        coverImageUrl,
      },
    });
  }

  return {
    id: album.id,
    slug: album.slug,
  };
}

export async function addMemberImagesToGallery({
  clubId,
  clubSlug,
  albumSlug,
  files,
  memberProfileId,
  memberName,
  memberEmail,
}: {
  clubId: string;
  clubSlug: string;
  albumSlug: string;
  files: File[];
  memberProfileId: string;
  memberName: string | null;
  memberEmail: string | null;
}) {
  if (files.length === 0) {
    throw new Error("Tilføj mindst ét billede.");
  }

  if (files.length > 40) {
    throw new Error("Du kan maksimalt uploade 40 billeder ad gangen.");
  }

  const album = await prisma.galleryAlbum.findFirst({
    where: {
      clubId,
      slug: albumSlug,
      status: GalleryAlbumStatus.PUBLISHED,
    },
    select: {
      id: true,
      coverImageUrl: true,
      images: {
        select: {
          sortOrder: true,
        },
        orderBy: {
          sortOrder: "desc",
        },
        take: 1,
      },
    },
  });

  if (!album) {
    throw new Error("Galleriet blev ikke fundet.");
  }

  const storedImages = await Promise.all(
    files.map((file) =>
      storeGalleryImageFile({
        clubSlug,
        albumId: album.id,
        file,
      }),
    ),
  );

  const currentHighestSortOrder = album.images[0]?.sortOrder ?? 0;

  await prisma.galleryImage.createMany({
    data: storedImages.map((storedImage, index) => ({
      clubId,
      albumId: album.id,
      title: null,
      caption: null,
      imageUrl: storedImage.publicUrl,
      thumbnailUrl: storedImage.publicUrl,
      originalName: storedImage.originalName,
      fileName: storedImage.fileName,
      mimeType: storedImage.mimeType,
      sizeBytes: storedImage.sizeBytes,
      storageProvider: storedImage.storageProvider,
      storageKey: storedImage.storageKey,
      sortOrder: currentHighestSortOrder + (index + 1) * 10,
      status: GalleryImageStatus.ACTIVE,
      uploadedAt: new Date(),
      uploadedByMemberProfileId: memberProfileId,
      uploadedByName: memberName,
      uploadedByEmail: memberEmail,
    })),
  });

  await prisma.galleryAlbum.update({
    where: {
      id: album.id,
    },
    data: {
      coverImageUrl: album.coverImageUrl || storedImages[0]?.publicUrl || null,
      updatedAt: new Date(),
    },
  });

  return {
    albumId: album.id,
  };
}
