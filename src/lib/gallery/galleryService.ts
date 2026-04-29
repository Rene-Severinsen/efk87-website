import prisma from "../db/prisma";
import { PublicSurfaceVisibility, GalleryAlbumStatus, GalleryImageStatus } from "../../generated/prisma";

export interface GalleryAlbumDTO {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  publishedAt: Date | null;
  imageCount: number;
}

export interface GalleryImageDTO {
  id: string;
  title: string | null;
  caption: string | null;
  imageUrl: string;
  thumbnailUrl: string | null;
  takenAt: Date | null;
}

export interface GalleryAlbumDetailDTO extends GalleryAlbumDTO {
  images: GalleryImageDTO[];
}

export async function getPublishedGalleryAlbums(
  clubId: string,
  viewer?: { isMember: boolean }
): Promise<GalleryAlbumDTO[]> {
  const visibilityThreshold = viewer?.isMember
    ? [PublicSurfaceVisibility.PUBLIC, PublicSurfaceVisibility.MEMBERS_ONLY]
    : [PublicSurfaceVisibility.PUBLIC];

  const albums = await prisma.galleryAlbum.findMany({
    where: {
      clubId,
      status: GalleryAlbumStatus.PUBLISHED,
      visibility: { in: visibilityThreshold },
    },
    orderBy: {
      sortOrder: "asc",
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      coverImageUrl: true,
      publishedAt: true,
      _count: {
        select: { images: { where: { status: GalleryImageStatus.ACTIVE } } },
      },
    },
  });

  return albums.map((album) => ({
    id: album.id,
    slug: album.slug,
    title: album.title,
    description: album.description,
    coverImageUrl: album.coverImageUrl,
    publishedAt: album.publishedAt,
    imageCount: album._count.images,
  }));
}

export async function getPublishedGalleryAlbumBySlug(
  clubId: string,
  slug: string,
  viewer?: { isMember: boolean }
): Promise<GalleryAlbumDetailDTO | null> {
  const visibilityThreshold = viewer?.isMember
    ? [PublicSurfaceVisibility.PUBLIC, PublicSurfaceVisibility.MEMBERS_ONLY]
    : [PublicSurfaceVisibility.PUBLIC];

  const album = await prisma.galleryAlbum.findFirst({
    where: {
      clubId,
      slug,
      status: GalleryAlbumStatus.PUBLISHED,
      visibility: { in: visibilityThreshold },
    },
    include: {
      images: {
        where: {
          status: GalleryImageStatus.ACTIVE,
        },
        orderBy: {
          sortOrder: "asc",
        },
        select: {
          id: true,
          title: true,
          caption: true,
          imageUrl: true,
          thumbnailUrl: true,
          takenAt: true,
        },
      },
      _count: {
        select: { images: { where: { status: GalleryImageStatus.ACTIVE } } },
      },
    },
  });

  if (!album) {
    return null;
  }

  return {
    id: album.id,
    slug: album.slug,
    title: album.title,
    description: album.description,
    coverImageUrl: album.coverImageUrl,
    publishedAt: album.publishedAt,
    imageCount: album._count.images,
    images: album.images,
  };
}
