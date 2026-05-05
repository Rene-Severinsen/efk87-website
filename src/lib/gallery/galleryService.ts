import prisma from "../db/prisma";
import {
  GalleryAlbumStatus,
  GalleryImageStatus,
  PublicSurfaceVisibility,
} from "../../generated/prisma";

export interface GalleryAlbumDTO {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
  imageCount: number;
  visibility: PublicSurfaceVisibility;
  createdByName: string | null;
}

export interface GalleryImageDTO {
  id: string;
  title: string | null;
  caption: string | null;
  imageUrl: string;
  thumbnailUrl: string | null;
  takenAt: Date | null;
  uploadedAt: Date | null;
}

export interface GalleryAlbumDetailDTO extends GalleryAlbumDTO {
  images: GalleryImageDTO[];
}

export interface HomepageGalleryImageDTO {
  id: string;
  imageUrl: string;
  title: string | null;
  caption: string | null;
  albumSlug: string;
  albumTitle: string;
  uploadedAt: Date | null;
  createdAt: Date;
}

export interface HomepageGalleryAlbumDTO {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  updatedAt: Date;
  imageCount: number;
}

export interface HomepageGalleryPreviewDTO {
  latestImages: HomepageGalleryImageDTO[];
  latestAlbums: HomepageGalleryAlbumDTO[];
  publicHomepageAlbums: HomepageGalleryAlbumDTO[];
}

function getVisibilityFilter(viewer?: { isMember: boolean }): PublicSurfaceVisibility[] {
  return viewer?.isMember
    ? [PublicSurfaceVisibility.PUBLIC, PublicSurfaceVisibility.MEMBERS_ONLY]
    : [PublicSurfaceVisibility.PUBLIC];
}

export async function getPublishedGalleryAlbums(
  clubId: string,
  viewer?: { isMember: boolean },
): Promise<GalleryAlbumDTO[]> {
  const albums = await prisma.galleryAlbum.findMany({
    where: {
      clubId,
      status: GalleryAlbumStatus.PUBLISHED,
      visibility: { in: getVisibilityFilter(viewer) },
    },
    orderBy: [
      { updatedAt: "desc" },
      { sortOrder: "asc" },
      { title: "asc" },
    ],
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      coverImageUrl: true,
      publishedAt: true,
      updatedAt: true,
      visibility: true,
      createdByName: true,
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

  return albums.map((album) => ({
    id: album.id,
    slug: album.slug,
    title: album.title,
    description: album.description,
    coverImageUrl: album.coverImageUrl,
    publishedAt: album.publishedAt,
    updatedAt: album.updatedAt,
    visibility: album.visibility,
    createdByName: album.createdByName,
    imageCount: album._count.images,
  }));
}

export async function getPublishedGalleryAlbumBySlug(
  clubId: string,
  slug: string,
  viewer?: { isMember: boolean },
): Promise<GalleryAlbumDetailDTO | null> {
  const album = await prisma.galleryAlbum.findFirst({
    where: {
      clubId,
      slug,
      status: GalleryAlbumStatus.PUBLISHED,
      visibility: { in: getVisibilityFilter(viewer) },
    },
    include: {
      images: {
        where: {
          status: GalleryImageStatus.ACTIVE,
        },
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
          thumbnailUrl: true,
          takenAt: true,
          uploadedAt: true,
        },
      },
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
    updatedAt: album.updatedAt,
    visibility: album.visibility,
    createdByName: album.createdByName,
    imageCount: album._count.images,
    images: album.images,
  };
}

export async function getHomepageGalleryPreview(
  clubId: string,
  viewer?: { isMember: boolean },
): Promise<HomepageGalleryPreviewDTO> {
  const visibility = getVisibilityFilter(viewer);

  const [latestImages, latestAlbums, publicHomepageAlbums] = await Promise.all([
    prisma.galleryImage.findMany({
      where: {
        clubId,
        status: GalleryImageStatus.ACTIVE,
        album: {
          status: GalleryAlbumStatus.PUBLISHED,
          visibility: { in: visibility },
        },
      },
      orderBy: [
        { uploadedAt: "desc" },
        { createdAt: "desc" },
      ],
      take: 6,
      select: {
        id: true,
        title: true,
        caption: true,
        imageUrl: true,
        uploadedAt: true,
        createdAt: true,
        album: {
          select: {
            slug: true,
            title: true,
          },
        },
      },
    }),

    prisma.galleryAlbum.findMany({
      where: {
        clubId,
        status: GalleryAlbumStatus.PUBLISHED,
        visibility: { in: visibility },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 6,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        coverImageUrl: true,
        updatedAt: true,
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
    }),

    prisma.galleryAlbum.findMany({
      where: {
        clubId,
        status: GalleryAlbumStatus.PUBLISHED,
        visibility: PublicSurfaceVisibility.PUBLIC,
        showOnPublicHomepage: true,
      },
      orderBy: [
        { homepageSortOrder: "asc" },
        { updatedAt: "desc" },
        { title: "asc" },
      ],
      take: 3,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        coverImageUrl: true,
        updatedAt: true,
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
    }),
  ]);

  return {
    latestImages: latestImages.map((image) => ({
      id: image.id,
      title: image.title,
      caption: image.caption,
      imageUrl: image.imageUrl,
      uploadedAt: image.uploadedAt,
      createdAt: image.createdAt,
      albumSlug: image.album.slug,
      albumTitle: image.album.title,
    })),
    latestAlbums: latestAlbums.map((album) => ({
      id: album.id,
      slug: album.slug,
      title: album.title,
      description: album.description,
      coverImageUrl: album.coverImageUrl,
      updatedAt: album.updatedAt,
      imageCount: album._count.images,
    })),
    publicHomepageAlbums: publicHomepageAlbums.map((album) => ({
      id: album.id,
      slug: album.slug,
      title: album.title,
      description: album.description,
      coverImageUrl: album.coverImageUrl,
      updatedAt: album.updatedAt,
      imageCount: album._count.images,
    })),
  };
}
