import prisma from "../db/prisma";
import {
  GalleryAlbumStatus,
  GalleryImageStatus,
  PublicSurfaceVisibility,
} from "../../generated/prisma";

export interface AdminGalleryOverviewDTO {
  albums: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    coverImageUrl: string | null;
    status: GalleryAlbumStatus;
    visibility: PublicSurfaceVisibility;
    imageCount: number;
    legacySource: string | null;
    legacyId: string | null;
    createdByName: string | null;
    createdByEmail: string | null;
    createdAt: Date;
    updatedAt: Date;
  }[];
  stats: {
    totalAlbums: number;
    totalImages: number;
    publishedAlbums: number;
  };
}

export interface AdminGalleryDetailDTO {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: GalleryAlbumStatus;
  visibility: PublicSurfaceVisibility;
  coverImageUrl: string | null;
  createdByName: string | null;
  createdByEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
  images: {
    id: string;
    title: string | null;
    caption: string | null;
    imageUrl: string;
    status: GalleryImageStatus;
    sizeBytes: number | null;
    uploadedByName: string | null;
    uploadedByEmail: string | null;
    uploadedAt: Date | null;
    createdAt: Date;
  }[];
}

export async function getAdminGalleryOverview(clubId: string): Promise<AdminGalleryOverviewDTO> {
  const albums = await prisma.galleryAlbum.findMany({
    where: { clubId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: {
          images: {
            where: {
              status: GalleryImageStatus.ACTIVE,
            },
          },
        },
      },
    },
  });

  const totalImages = await prisma.galleryImage.count({
    where: {
      clubId,
      status: GalleryImageStatus.ACTIVE,
    },
  });

  const publishedAlbumsCount = albums.filter(
    (album) => album.status === GalleryAlbumStatus.PUBLISHED,
  ).length;

  return {
    albums: albums.map((album) => ({
      id: album.id,
      slug: album.slug,
      title: album.title,
      description: album.description,
      coverImageUrl: album.coverImageUrl,
      status: album.status,
      visibility: album.visibility,
      imageCount: album._count.images,
      legacySource: album.legacySource,
      legacyId: album.legacyId,
      createdByName: album.createdByName,
      createdByEmail: album.createdByEmail,
      createdAt: album.createdAt,
      updatedAt: album.updatedAt,
    })),
    stats: {
      totalAlbums: albums.length,
      totalImages,
      publishedAlbums: publishedAlbumsCount,
    },
  };
}

export async function getAdminGalleryDetail(
  clubId: string,
  albumId: string,
): Promise<AdminGalleryDetailDTO | null> {
  const album = await prisma.galleryAlbum.findFirst({
    where: {
      id: albumId,
      clubId,
    },
    include: {
      images: {
        orderBy: [
          { sortOrder: "asc" },
          { uploadedAt: "asc" },
          { createdAt: "asc" },
        ],
        select: {
          id: true,
          title: true,
          caption: true,
          imageUrl: true,
          status: true,
          sizeBytes: true,
          uploadedByName: true,
          uploadedByEmail: true,
          uploadedAt: true,
          createdAt: true,
        },
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
    status: album.status,
    visibility: album.visibility,
    coverImageUrl: album.coverImageUrl,
    createdByName: album.createdByName,
    createdByEmail: album.createdByEmail,
    createdAt: album.createdAt,
    updatedAt: album.updatedAt,
    images: album.images,
  };
}
