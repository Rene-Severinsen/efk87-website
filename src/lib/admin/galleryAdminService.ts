import prisma from "../db/prisma";
import { GalleryAlbumStatus, PublicSurfaceVisibility } from "../../generated/prisma";

export interface AdminGalleryOverviewDTO {
  albums: {
    id: string;
    title: string;
    status: GalleryAlbumStatus;
    visibility: PublicSurfaceVisibility;
    imageCount: number;
    legacySource: string | null;
    legacyId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }[];
  stats: {
    totalAlbums: number;
    totalImages: number;
    publishedAlbums: number;
  };
}

export async function getAdminGalleryOverview(clubId: string): Promise<AdminGalleryOverviewDTO> {
  const albums = await prisma.galleryAlbum.findMany({
    where: {
      clubId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: { images: true },
      },
    },
  });

  const totalImages = await prisma.galleryImage.count({
    where: {
      clubId,
    },
  });

  const publishedAlbumsCount = albums.filter(a => a.status === GalleryAlbumStatus.PUBLISHED).length;

  return {
    albums: albums.map((album) => ({
      id: album.id,
      title: album.title,
      status: album.status,
      visibility: album.visibility,
      imageCount: album._count.images,
      legacySource: album.legacySource,
      legacyId: album.legacyId,
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
