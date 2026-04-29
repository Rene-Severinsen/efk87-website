import prisma from "../db/prisma";
import * as PrismaModels from "../../generated/prisma";
import { GalleryAlbumStatus, PublicSurfaceVisibility } from "../../generated/prisma";

export interface AdminGalleryOverviewDTO {
  albums: {
    id: string;
    title: string;
    status: PrismaModels.GalleryAlbumStatus;
    visibility: PrismaModels.PublicSurfaceVisibility;
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
  console.log("prisma models available:", Object.keys(prisma).filter(k => !k.startsWith('$')));
  
  // @ts-ignore - debugging why it is undefined at runtime
  if (!prisma.galleryAlbum) {
    throw new Error("prisma.galleryAlbum is undefined in getAdminGalleryOverview");
  }

  const albums = await (prisma as any).galleryAlbum.findMany({
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

  const totalImages = await (prisma as any).galleryImage.count({
    where: {
      clubId,
    },
  });

  const publishedAlbumsCount = (albums as any[]).filter(a => a.status === GalleryAlbumStatus.PUBLISHED).length;

  return {
    albums: (albums as any[]).map((album) => ({
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
