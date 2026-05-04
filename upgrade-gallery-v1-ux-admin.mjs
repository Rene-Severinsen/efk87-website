import fs from "fs";
import path from "path";

const root = process.cwd();

function ensureDir(filePath) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeFile(relativePath, content) {
    const absolutePath = path.join(root, relativePath);
    ensureDir(absolutePath);
    fs.writeFileSync(absolutePath, content.trimStart(), "utf8");
    console.log(`Wrote ${relativePath}`);
}

function patchFile(relativePath, patcher) {
    const absolutePath = path.join(root, relativePath);

    if (!fs.existsSync(absolutePath)) {
        console.warn(`Skipped ${relativePath} — file not found`);
        return;
    }

    const current = fs.readFileSync(absolutePath, "utf8");
    const next = patcher(current);

    if (next === current) {
        console.log(`No change ${relativePath}`);
        return;
    }

    fs.writeFileSync(absolutePath, next, "utf8");
    console.log(`Patched ${relativePath}`);
}

patchFile("prisma/schema.prisma", (current) => {
    let next = current;

    next = next.replace(
        /model GalleryAlbum \{([\s\S]*?)publishedAt\s+DateTime\?/,
        (match) => {
            if (match.includes("createdByMemberProfileId")) return match;

            return match.replace(
                "publishedAt   DateTime?",
                `publishedAt   DateTime?
  createdByMemberProfileId String?
  createdByName            String?
  createdByEmail           String?`,
            );
        },
    );

    next = next.replace(
        /model GalleryImage \{([\s\S]*?)imageUrl\s+String/,
        (match) => {
            if (match.includes("originalName")) return match;

            return match.replace(
                "imageUrl     String",
                `imageUrl     String
  originalName String?
  fileName     String?
  mimeType     String?
  sizeBytes    Int?
  storageProvider String @default("LOCAL")
  storageKey      String?`,
            );
        },
    );

    next = next.replace(
        /model GalleryImage \{([\s\S]*?)uploadedAt\s+DateTime\?/,
        (match) => {
            if (match.includes("uploadedByMemberProfileId")) return match;

            return match.replace(
                "uploadedAt   DateTime?",
                `uploadedAt   DateTime?
  uploadedByMemberProfileId String?
  uploadedByName            String?
  uploadedByEmail           String?`,
            );
        },
    );

    return next;
});

writeFile(
    "src/lib/gallery/galleryService.ts",
    `
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

  const [latestImages, latestAlbums] = await Promise.all([
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
  };
}
`,
);

writeFile(
    "src/components/gallery/GalleryLightbox.tsx",
    `
"use client";

import { useEffect, useState } from "react";

interface GalleryLightboxImage {
  id: string;
  imageUrl: string;
  title: string | null;
  caption: string | null;
}

interface GalleryLightboxProps {
  images: GalleryLightboxImage[];
}

export default function GalleryLightbox({ images }: GalleryLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const activeImage = activeIndex === null ? null : images[activeIndex];

  function open(index: number) {
    setActiveIndex(index);
  }

  function close() {
    setActiveIndex(null);
  }

  function previous() {
    setActiveIndex((current) => {
      if (current === null) return current;
      return current === 0 ? images.length - 1 : current - 1;
    });
  }

  function next() {
    setActiveIndex((current) => {
      if (current === null) return current;
      return current === images.length - 1 ? 0 : current + 1;
    });
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (activeIndex === null) return;

      if (event.key === "Escape") {
        close();
      }

      if (event.key === "ArrowLeft") {
        previous();
      }

      if (event.key === "ArrowRight") {
        next();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, images.length]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-4">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => open(index)}
            className="group overflow-hidden rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-card)] text-left shadow-[var(--public-card-shadow)] transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="aspect-square overflow-hidden bg-[var(--public-surface)]">
              <img
                src={image.imageUrl}
                alt={image.title || image.caption || "Galleribillede"}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </div>

            {(image.title || image.caption) ? (
              <div className="p-3">
                {image.title ? (
                  <h4 className="truncate text-sm font-semibold text-[var(--public-text)]">
                    {image.title}
                  </h4>
                ) : null}

                {image.caption ? (
                  <p className="mt-1 line-clamp-1 text-xs text-[var(--public-text-muted)]">
                    {image.caption}
                  </p>
                ) : null}
              </div>
            ) : null}
          </button>
        ))}
      </div>

      {activeImage && activeIndex !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <div
            className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-black shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-black/70 px-4 py-3">
              <div className="min-w-0 text-white">
                <p className="truncate text-sm font-bold">
                  {activeImage.title || activeImage.caption || "Galleribillede"}
                </p>
                <p className="text-xs text-white/60">
                  {activeIndex + 1} / {images.length}
                </p>
              </div>

              <button
                type="button"
                onClick={close}
                className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-white transition hover:bg-white/20"
              >
                Luk
              </button>
            </div>

            <div className="relative flex min-h-[320px] items-center justify-center">
              <img
                src={activeImage.imageUrl}
                alt={activeImage.title || activeImage.caption || "Galleribillede"}
                className="max-h-[82vh] w-full object-contain"
              />

              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={previous}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-4 py-3 text-xl font-bold text-white transition hover:bg-black/80"
                    aria-label="Forrige billede"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-4 py-3 text-xl font-bold text-white transition hover:bg-black/80"
                    aria-label="Næste billede"
                  >
                    ›
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
`,
);

writeFile(
    "src/components/publicSite/homeV2/HomeGalleryToggle.tsx",
    `
"use client";

import { useState } from "react";
import Link from "next/link";
import { HomepageGalleryPreviewDTO } from "../../../lib/gallery/galleryService";
import { publicRoutes } from "../../../lib/publicRoutes";

interface HomeGalleryToggleProps {
  clubSlug: string;
  galleryPreview: HomepageGalleryPreviewDTO;
}

export default function HomeGalleryToggle({
  clubSlug,
  galleryPreview,
}: HomeGalleryToggleProps) {
  const [mode, setMode] = useState<"images" | "albums">("images");

  const hasImages = galleryPreview.latestImages.length > 0;
  const hasAlbums = galleryPreview.latestAlbums.length > 0;

  return (
    <article className="home-v2-card home-v2-section-card">
      <div className="home-v2-section-head">
        <h2>{mode === "images" ? "Seneste billeder" : "Seneste gallerier"}</h2>
        <Link className="home-v2-link-soft" href={publicRoutes.gallery(clubSlug)}>
          Åbn galleri
        </Link>
      </div>

      <div className="home-v2-gallery-toggle">
        <button
          type="button"
          className={mode === "images" ? "home-v2-gallery-toggle-active" : ""}
          onClick={() => setMode("images")}
        >
          Seneste billeder
        </button>
        <button
          type="button"
          className={mode === "albums" ? "home-v2-gallery-toggle-active" : ""}
          onClick={() => setMode("albums")}
        >
          Seneste gallerier
        </button>
      </div>

      {mode === "images" ? (
        hasImages ? (
          <div className="home-v2-gallery-grid">
            {galleryPreview.latestImages.map((image) => (
              <Link
                key={image.id}
                href={publicRoutes.galleryAlbum(clubSlug, image.albumSlug)}
                className="home-v2-gallery-item"
              >
                <img
                  src={image.imageUrl}
                  alt={image.title || image.caption || image.albumTitle}
                  className="home-v2-gallery-image-img"
                />
                <div className="home-v2-gallery-label">
                  {image.title || image.albumTitle}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="home-v2-compact-empty">Ingen billeder endnu</div>
        )
      ) : hasAlbums ? (
        <div className="home-v2-gallery-grid">
          {galleryPreview.latestAlbums.map((album) => (
            <Link
              key={album.id}
              href={publicRoutes.galleryAlbum(clubSlug, album.slug)}
              className="home-v2-gallery-item"
            >
              {album.coverImageUrl ? (
                <img
                  src={album.coverImageUrl}
                  alt={album.title}
                  className="home-v2-gallery-image-img"
                />
              ) : (
                <div className="home-v2-gallery-image home-v2-gallery-image-empty" />
              )}
              <div className="home-v2-gallery-label">
                {album.title} · {album.imageCount} billeder
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="home-v2-compact-empty">Ingen gallerier endnu</div>
      )}
    </article>
  );
}
`,
);

writeFile(
    "src/app/[clubSlug]/galleri/page.tsx",
    `
import { notFound } from "next/navigation";
import Link from "next/link";
import { resolvePublicPageForClub } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../components/publicSite/ThemedBuildingBlocks";
import { getPublishedGalleryAlbums } from "../../../lib/gallery/galleryService";
import { getServerViewerForClub } from "../../../lib/auth/viewer";
import { publicRoutes } from "../../../lib/publicRoutes";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function GalleriPage({ params }: PageProps) {
  const { clubSlug } = await params;
  const pageSlug = "galleri";
  const { club, page, theme, footerData, navigationItems, actionItems, publicSettings } =
    await resolvePublicPageForClub(clubSlug, pageSlug);

  if (!page) {
    notFound();
  }

  const viewer = await getServerViewerForClub(club.id);
  const albums = await getPublishedGalleryAlbums(club.id, { isMember: viewer.isMember });

  return (
    <ThemedClubPageShell
      clubSlug={clubSlug}
      clubName={club.settings?.shortName || club.name}
      clubDisplayName={club.settings?.displayName || club.name}
      theme={theme}
      publicThemeMode={publicSettings?.publicThemeMode}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title="Galleri"
      subtitle="Billeder og albums fra klubbens liv."
      currentPath={publicRoutes.gallery(clubSlug)}
      maxWidth="1120px"
    >
      {viewer.isMember ? (
        <div className="mb-6 flex justify-end">
          <Link href={publicRoutes.galleryNew(clubSlug)} className="public-primary-button">
            Opret galleri
          </Link>
        </div>
      ) : null}

      {albums.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <Link
              key={album.id}
              href={publicRoutes.galleryAlbum(clubSlug, album.slug)}
              className="group no-underline"
            >
              <ThemedSectionCard className="flex h-full overflow-hidden p-0 transition duration-200 group-hover:-translate-y-1 group-hover:shadow-xl">
                <div className="flex h-full w-full flex-col">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[var(--public-surface)]">
                    {album.coverImageUrl ? (
                      <img
                        src={album.coverImageUrl}
                        alt={album.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[var(--public-text-muted)]">
                        Ingen billeder endnu
                      </div>
                    )}

                    {album.visibility === "MEMBERS_ONLY" ? (
                      <div className="absolute right-3 top-3 rounded-full bg-[var(--public-card)] px-3 py-1 text-xs font-bold text-[var(--public-primary)] shadow">
                        Kun medlemmer
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-xl font-bold leading-tight text-[var(--public-text)]">
                      {album.title}
                    </h2>

                    {album.description ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--public-text-muted)]">
                        {album.description}
                      </p>
                    ) : null}

                    <div className="mt-auto flex items-center justify-between pt-5 text-xs font-medium text-[var(--public-text-muted)]">
                      <span>{album.imageCount} billeder</span>
                      <span>{album.updatedAt.toLocaleDateString("da-DK")}</span>
                    </div>
                  </div>
                </div>
              </ThemedSectionCard>
            </Link>
          ))}
        </div>
      ) : (
        <ThemedSectionCard>
          <p className="py-8 text-center text-[var(--public-text-muted)]">
            Der er endnu ingen albums i galleriet.
          </p>
        </ThemedSectionCard>
      )}
    </ThemedClubPageShell>
  );
}
`,
);

writeFile(
    "src/app/[clubSlug]/galleri/[albumSlug]/page.tsx",
    `
import { notFound } from "next/navigation";
import Link from "next/link";
import { resolvePublicPageForClub } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { getPublishedGalleryAlbumBySlug } from "../../../../lib/gallery/galleryService";
import { getServerViewerForClub } from "../../../../lib/auth/viewer";
import { publicRoutes } from "../../../../lib/publicRoutes";
import GalleryLightbox from "../../../../components/gallery/GalleryLightbox";

interface PageProps {
  params: Promise<{
    clubSlug: string;
    albumSlug: string;
  }>;
}

export default async function AlbumDetailPage({ params }: PageProps) {
  const { clubSlug, albumSlug } = await params;

  const { club, theme, footerData, navigationItems, actionItems, publicSettings } =
    await resolvePublicPageForClub(clubSlug, "galleri");

  const viewer = await getServerViewerForClub(club.id);
  const album = await getPublishedGalleryAlbumBySlug(club.id, albumSlug, {
    isMember: viewer.isMember,
  });

  if (!album) {
    notFound();
  }

  return (
    <ThemedClubPageShell
      clubSlug={clubSlug}
      clubName={club.settings?.shortName || club.name}
      clubDisplayName={club.settings?.displayName || club.name}
      theme={theme}
      publicThemeMode={publicSettings?.publicThemeMode}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title={album.title}
      subtitle={album.description || undefined}
      currentPath={publicRoutes.galleryAlbum(clubSlug, albumSlug)}
      maxWidth="1120px"
    >
      <div className="mb-6">
        <Link href={publicRoutes.gallery(clubSlug)} className="public-link">
          ← Tilbage til galleri
        </Link>
      </div>

      <ThemedSectionCard className="mb-6 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--public-text-muted)]">
              {album.imageCount} billeder
              {album.createdByName ? <> · Oprettet af {album.createdByName}</> : null}
            </p>
            {album.visibility === "MEMBERS_ONLY" ? (
              <p className="mt-2 inline-flex rounded-full bg-[var(--public-primary-soft)] px-3 py-1 text-xs font-bold text-[var(--public-primary)]">
                Kun for medlemmer
              </p>
            ) : null}
          </div>

          {album.updatedAt ? (
            <p className="text-sm text-[var(--public-text-muted)]">
              Opdateret {album.updatedAt.toLocaleDateString("da-DK")}
            </p>
          ) : null}
        </div>
      </ThemedSectionCard>

      {album.images.length > 0 ? (
        <GalleryLightbox
          images={album.images.map((image) => ({
            id: image.id,
            imageUrl: image.imageUrl,
            title: image.title,
            caption: image.caption,
          }))}
        />
      ) : (
        <ThemedSectionCard>
          <p className="py-8 text-center text-[var(--public-text-muted)]">
            Dette album har endnu ingen billeder.
          </p>
        </ThemedSectionCard>
      )}
    </ThemedClubPageShell>
  );
}
`,
);

writeFile(
    "src/app/[clubSlug]/galleri/nyt/NewGalleryForm.tsx",
    `
"use client";

import { DragEvent, FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface NewGalleryFormProps {
  clubSlug: string;
}

interface UploadResult {
  success: boolean;
  error?: string;
  galleryUrl?: string;
}

function uniqueFiles(files: File[]): File[] {
  const seen = new Set<string>();

  return files.filter((file) => {
    const key = \`\${file.name}-\${file.size}-\${file.lastModified}\`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export default function NewGalleryForm({ clubSlug }: NewGalleryFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addFiles(files: FileList | File[]) {
    const incoming = Array.from(files);
    setSelectedFiles((current) => uniqueFiles([...current, ...incoming]).slice(0, 40));
  }

  function removeFile(index: number) {
    setSelectedFiles((current) => current.filter((_file, fileIndex) => fileIndex !== index));
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSaving(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.delete("images");

    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const response = await fetch(\`/\${clubSlug}/galleri/nyt/upload\`, {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as UploadResult;

      if (!response.ok || !result.success || !result.galleryUrl) {
        setError(result.error || "Galleriet kunne ikke oprettes.");
        return;
      }

      router.push(result.galleryUrl);
      router.refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Galleriet kunne ikke oprettes.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="mt-6 space-y-6 rounded-3xl border border-[var(--public-card-border)] bg-[var(--public-card)] p-5 shadow-[var(--public-card-shadow)] sm:p-6"
    >
      <div className="space-y-2">
        <label htmlFor="title" className="public-label">
          Navn på galleri
        </label>
        <input
          id="title"
          name="title"
          required
          className="public-input"
          placeholder="Fx Sommerflyvning 2026"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="public-label">
          Beskrivelse
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          className="public-input min-h-32 resize-y"
          placeholder="Skriv en kort tekst om billederne..."
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="public-label">Synlighed</legend>

        <label className="flex items-center gap-3 rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-4 text-[var(--public-text)]">
          <input type="radio" name="visibility" value="PUBLIC" defaultChecked className="h-4 w-4" />
          <span>
            <span className="block font-semibold">Offentligt</span>
            <span className="block text-sm text-[var(--public-text-muted)]">Kan ses af alle besøgende.</span>
          </span>
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-4 text-[var(--public-text)]">
          <input type="radio" name="visibility" value="MEMBERS_ONLY" className="h-4 w-4" />
          <span>
            <span className="block font-semibold">Kun for medlemmer</span>
            <span className="block text-sm text-[var(--public-text-muted)]">Kræver login som medlem.</span>
          </span>
        </label>
      </fieldset>

      <div className="space-y-2">
        <label htmlFor="images" className="public-label">Billeder</label>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={[
            "rounded-3xl border border-dashed p-6 text-center transition",
            isDragging
              ? "border-[var(--public-primary)] bg-[var(--public-primary-soft)]"
              : "border-[var(--public-card-border)] bg-[var(--public-surface)]",
          ].join(" ")}
        >
          <input
            id="images"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
            multiple
            onChange={(event) => {
              if (event.target.files) addFiles(event.target.files);
              event.currentTarget.value = "";
            }}
            className="mx-auto block max-w-full text-sm text-[var(--public-text)] file:mr-4 file:rounded-xl file:border-0 file:bg-[var(--public-primary)] file:px-4 file:py-2 file:text-sm file:font-bold file:text-[var(--public-primary-contrast)]"
          />

          <p className="mt-3 text-sm text-[var(--public-text-muted)]">
            Træk billeder hertil, eller vælg flere billeder fra telefonens fotoalbum. Maks 40 billeder.
          </p>
        </div>

        {selectedFiles.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {selectedFiles.map((file, index) => (
              <div
                key={\`\${file.name}-\${file.size}-\${file.lastModified}\`}
                className="rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-3 text-sm text-[var(--public-text)]"
              >
                <p className="truncate font-semibold">{file.name}</p>
                <p className="mt-1 text-xs text-[var(--public-text-muted)]">{Math.round(file.size / 1024)} KB</p>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="mt-2 text-xs font-bold text-[var(--public-primary)]"
                >
                  Fjern
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {error ? <div className="public-alert">{error}</div> : null}

      <div className="flex justify-end">
        <button type="submit" disabled={isSaving || selectedFiles.length === 0} className="public-primary-button disabled:opacity-60">
          {isSaving ? "Opretter..." : "Opret galleri"}
        </button>
      </div>
    </form>
  );
}
`,
);

writeFile(
    "src/lib/admin/galleryAdminService.ts",
    `
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

  const publishedAlbumsCount = albums.filter((album) => album.status === GalleryAlbumStatus.PUBLISHED).length;

  return {
    albums: albums.map((album) => ({
      id: album.id,
      slug: album.slug,
      title: album.title,
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
`,
);

writeFile(
    "src/lib/admin/galleryAdminActions.ts",
    `
"use server";

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
});

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function updateAdminGalleryAction(
  clubSlug: string,
  albumId: string,
  formData: FormData,
) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug, \`/\${clubSlug}/admin/galleri/\${albumId}\`);

  const parsed = galleryUpdateSchema.safeParse({
    title: getText(formData, "title"),
    description: getText(formData, "description"),
    status: getText(formData, "status"),
    visibility: getText(formData, "visibility"),
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
    },
  });

  revalidatePath(\`/\${clubSlug}/admin/galleri\`);
  revalidatePath(\`/\${clubSlug}/admin/galleri/\${albumId}\`);
  revalidatePath(\`/\${clubSlug}/galleri\`);
}

export async function hideGalleryImageAdminAction(
  clubSlug: string,
  albumId: string,
  imageId: string,
) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug, \`/\${clubSlug}/admin/galleri/\${albumId}\`);

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

  revalidatePath(\`/\${clubSlug}/admin/galleri\`);
  revalidatePath(\`/\${clubSlug}/admin/galleri/\${albumId}\`);
  revalidatePath(\`/\${clubSlug}/galleri\`);
}

export async function setGalleryCoverImageAdminAction(
  clubSlug: string,
  albumId: string,
  imageUrl: string,
) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug, \`/\${clubSlug}/admin/galleri/\${albumId}\`);

  await prisma.galleryAlbum.updateMany({
    where: {
      id: albumId,
      clubId: club.id,
    },
    data: {
      coverImageUrl: imageUrl,
    },
  });

  revalidatePath(\`/\${clubSlug}/admin/galleri\`);
  revalidatePath(\`/\${clubSlug}/admin/galleri/\${albumId}\`);
  revalidatePath(\`/\${clubSlug}/galleri\`);
}
`,
);

writeFile(
    "src/app/[clubSlug]/admin/galleri/page.tsx",
    `
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../components/admin/AdminShell";
import { getAdminGalleryOverview } from "../../../../lib/admin/galleryAdminService";
import "../../../../components/admin/AdminDashboard.css";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { clubSlug } = await params;

  let club;

  try {
    club = await requireClubBySlug(clubSlug);
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }

    throw error;
  }

  const viewer = await requireClubAdminForClub(club.id, clubSlug, \`/\${clubSlug}/admin/galleri\`);
  const { albums, stats } = await getAdminGalleryOverview(club.id);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <div className="admin-gallery-page">
        <div className="admin-header-section" style={{ marginBottom: "24px" }}>
          <h1 className="admin-section-title">Galleri</h1>
          <p className="admin-section-subtitle">
            Administrér medlemsgallerier, synlighed, status og billeder.
          </p>
        </div>

        <div
          className="admin-stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div className="admin-card">
            <div style={{ fontSize: "0.875rem", color: "#8c8c8c" }}>Albums</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{stats.totalAlbums}</div>
          </div>
          <div className="admin-card">
            <div style={{ fontSize: "0.875rem", color: "#8c8c8c" }}>Billeder</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{stats.totalImages}</div>
          </div>
          <div className="admin-card">
            <div style={{ fontSize: "0.875rem", color: "#8c8c8c" }}>Publicerede albums</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{stats.publishedAlbums}</div>
          </div>
        </div>

        <div className="admin-card">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f0f0f0", textAlign: "left" }}>
                <th style={{ padding: "12px 8px" }}>Titel</th>
                <th style={{ padding: "12px 8px" }}>Oprettet af</th>
                <th style={{ padding: "12px 8px" }}>Status</th>
                <th style={{ padding: "12px 8px" }}>Synlighed</th>
                <th style={{ padding: "12px 8px" }}>Billeder</th>
                <th style={{ padding: "12px 8px" }}>Opdateret</th>
                <th style={{ padding: "12px 8px" }}>Handling</th>
              </tr>
            </thead>
            <tbody>
              {albums.length > 0 ? (
                albums.map((album) => (
                  <tr key={album.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 8px", fontWeight: 700 }}>{album.title}</td>
                    <td style={{ padding: "12px 8px" }}>{album.createdByName || album.createdByEmail || "-"}</td>
                    <td style={{ padding: "12px 8px" }}>
                      <span className={\`admin-badge \${album.status.toLowerCase()}\`}>{album.status}</span>
                    </td>
                    <td style={{ padding: "12px 8px" }}>{album.visibility}</td>
                    <td style={{ padding: "12px 8px" }}>{album.imageCount}</td>
                    <td style={{ padding: "12px 8px", fontSize: "0.875rem" }}>
                      {album.updatedAt.toLocaleDateString("da-DK")}
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <Link href={\`/\${clubSlug}/admin/galleri/\${album.id}\`} className="admin-btn">
                        Åbn
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "#8c8c8c" }}>
                    Ingen albums fundet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
`,
);

writeFile(
    "src/app/[clubSlug]/admin/galleri/[albumId]/page.tsx",
    `
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GalleryAlbumStatus,
  PublicSurfaceVisibility,
} from "../../../../../generated/prisma";
import AdminShell from "../../../../../components/admin/AdminShell";
import {
  hideGalleryImageAdminAction,
  setGalleryCoverImageAdminAction,
  updateAdminGalleryAction,
} from "../../../../../lib/admin/galleryAdminActions";
import { getAdminGalleryDetail } from "../../../../../lib/admin/galleryAdminService";
import { requireClubAdminForClub } from "../../../../../lib/auth/adminAccessGuards";
import { requireClubBySlug, TenancyError } from "../../../../../lib/tenancy/tenantService";
import "../../../../../components/admin/AdminDashboard.css";

interface PageProps {
  params: Promise<{
    clubSlug: string;
    albumId: string;
  }>;
}

function formatFileSize(sizeBytes: number | null): string {
  if (!sizeBytes) return "-";
  if (sizeBytes < 1024) return \`\${sizeBytes} B\`;
  if (sizeBytes < 1024 * 1024) return \`\${Math.round(sizeBytes / 1024)} KB\`;

  return \`\${(sizeBytes / (1024 * 1024)).toFixed(1)} MB\`;
}

export default async function AdminGalleryDetailPage({ params }: PageProps) {
  const { clubSlug, albumId } = await params;

  let club;

  try {
    club = await requireClubBySlug(clubSlug);
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }

    throw error;
  }

  const viewer = await requireClubAdminForClub(
    club.id,
    clubSlug,
    \`/\${clubSlug}/admin/galleri/\${albumId}\`,
  );

  const album = await getAdminGalleryDetail(club.id, albumId);

  if (!album) {
    notFound();
  }

  const updateAction = updateAdminGalleryAction.bind(null, clubSlug, albumId);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <div className="admin-gallery-detail-page">
        <div className="admin-header-section" style={{ marginBottom: "24px" }}>
          <Link href={\`/\${clubSlug}/admin/galleri\`} className="admin-btn" style={{ marginBottom: "16px" }}>
            ← Tilbage
          </Link>
          <h1 className="admin-section-title">{album.title}</h1>
          <p className="admin-section-subtitle">
            {album.images.length} billeder · {album.createdByName || album.createdByEmail || "Ukendt opretter"}
          </p>
        </div>

        <form action={updateAction} className="admin-card" style={{ marginBottom: "32px", padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontWeight: 700, marginBottom: "8px" }}>Titel</label>
              <input
                name="title"
                defaultValue={album.title}
                required
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d9d9d9" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 700, marginBottom: "8px" }}>Status</label>
              <select
                name="status"
                defaultValue={album.status}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d9d9d9" }}
              >
                <option value={GalleryAlbumStatus.PUBLISHED}>Publiceret</option>
                <option value={GalleryAlbumStatus.DRAFT}>Kladde</option>
                <option value={GalleryAlbumStatus.ARCHIVED}>Arkiveret/skjult</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 700, marginBottom: "8px" }}>Synlighed</label>
              <select
                name="visibility"
                defaultValue={album.visibility}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d9d9d9" }}
              >
                <option value={PublicSurfaceVisibility.PUBLIC}>Offentlig</option>
                <option value={PublicSurfaceVisibility.MEMBERS_ONLY}>Kun medlemmer</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 700, marginBottom: "8px" }}>Slug</label>
              <input
                value={album.slug}
                readOnly
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d9d9d9", opacity: 0.7 }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontWeight: 700, marginBottom: "8px" }}>Beskrivelse</label>
              <textarea
                name="description"
                defaultValue={album.description || ""}
                rows={4}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d9d9d9" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
            <button type="submit" className="admin-btn admin-btn-primary">
              Gem galleri
            </button>
          </div>
        </form>

        <div className="admin-card" style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "20px" }}>Billeder</h2>

          {album.images.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" }}>
              {album.images.map((image) => (
                <div key={image.id} style={{ border: "1px solid #263244", borderRadius: "16px", overflow: "hidden", background: "#101827" }}>
                  <div style={{ aspectRatio: "1 / 1", background: "#0b1120" }}>
                    <img src={image.imageUrl} alt={image.title || image.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>

                  <div style={{ padding: "12px", display: "grid", gap: "8px" }}>
                    <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                      {image.status} · {formatFileSize(image.sizeBytes)}
                    </div>

                    <form action={setGalleryCoverImageAdminAction.bind(null, clubSlug, album.id, image.imageUrl)}>
                      <button type="submit" className="admin-btn" style={{ width: "100%" }}>
                        Brug som cover
                      </button>
                    </form>

                    {image.status === "ACTIVE" ? (
                      <form action={hideGalleryImageAdminAction.bind(null, clubSlug, album.id, image.id)}>
                        <button type="submit" className="admin-btn" style={{ width: "100%", color: "#fca5a5" }}>
                          Skjul billede
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#8c8c8c" }}>Ingen billeder i dette galleri.</p>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
`,
);

patchFile("src/lib/publicRoutes.ts", (current) => {
    if (current.includes("galleryNew:")) return current;

    return current.replace(
        /galleryAlbum:\s*\(clubSlug:\s*string,\s*albumSlug:\s*string\)\s*=>\s*`\/\$\{clubSlug\}\/galleri\/\$\{albumSlug\}`,/,
        `galleryAlbum: (clubSlug: string, albumSlug: string) => \`/\${clubSlug}/galleri/\${albumSlug}\`,
  galleryNew: (clubSlug: string) => \`/\${clubSlug}/galleri/nyt\`,`,
    );
});

patchFile("src/app/[clubSlug]/page.tsx", (current) => {
    let next = current;

    if (!next.includes("getHomepageGalleryPreview")) {
        next = next.replace(
            `import { getFlightSchoolHomepageView } from "../../lib/flightSchool/flightSchoolBookingService";`,
            `import { getFlightSchoolHomepageView } from "../../lib/flightSchool/flightSchoolBookingService";
import { getHomepageGalleryPreview } from "../../lib/gallery/galleryService";`,
        );
    }

    next = next.replace(
        `const flightSchoolHomepage = await getFlightSchoolHomepageView(club.id);`,
        `const flightSchoolHomepage = await getFlightSchoolHomepageView(club.id);
  const galleryPreview = await getHomepageGalleryPreview(club.id, viewer);`,
    );

    if (!next.includes("galleryPreview={galleryPreview}")) {
        next = next.replace(
            `footerData={footerData}
      />`,
            `footerData={footerData}
          galleryPreview={galleryPreview}
      />`,
        );
    }

    return next;
});

patchFile("src/components/publicSite/homeV2/PublicClubHomePageV2.tsx", (current) => {
    let next = current;

    if (!next.includes("HomeGalleryToggle")) {
        next = next.replace(
            `import Avatar from '../../shared/Avatar';`,
            `import Avatar from '../../shared/Avatar';
import HomeGalleryToggle from './HomeGalleryToggle';
import { HomepageGalleryPreviewDTO } from '../../../lib/gallery/galleryService';`,
        );
    }

    if (!next.includes("galleryPreview: HomepageGalleryPreviewDTO;")) {
        next = next.replace(
            `flightSchoolHomepage: FlightSchoolHomepageViewModel;`,
            `flightSchoolHomepage: FlightSchoolHomepageViewModel;
  galleryPreview: HomepageGalleryPreviewDTO;`,
        );
    }

    next = next.replace(
        `export default function PublicClubHomePageV2({ club, viewer, todayFlightIntents, memberActivity, navigationItems, actionItems, newMemberHighlights, calendarMarquee, latestForumActivity, homepageContents, flightSchoolHomepage, weather, footerData }: PublicClubHomePageV2Props)`,
        `export default function PublicClubHomePageV2({ club, viewer, todayFlightIntents, memberActivity, navigationItems, actionItems, newMemberHighlights, calendarMarquee, latestForumActivity, homepageContents, flightSchoolHomepage, galleryPreview, weather, footerData }: PublicClubHomePageV2Props)`,
    );

    const start = next.indexOf(`<article className="home-v2-card home-v2-section-card">
              <div className="home-v2-section-head">
                <h2>Seneste billeder</h2>`);
    const end = next.indexOf(`            </article>`, start);

    if (start !== -1 && end !== -1) {
        next = `${next.slice(0, start)}<HomeGalleryToggle clubSlug={club.slug} galleryPreview={galleryPreview} />${next.slice(end + `            </article>`.length)}`;
    }

    return next;
});

patchFile("src/components/publicSite/homeV2/PublicClubHomePageV2.css", (current) => {
    if (current.includes(".home-v2-gallery-toggle")) return current;

    return `${current}

.home-v2-gallery-toggle {
  display: inline-flex;
  gap: 0.35rem;
  margin-bottom: 1rem;
  padding: 0.25rem;
  border: 1px solid var(--home-card-border);
  border-radius: 999px;
  background: var(--home-surface);
}

.home-v2-gallery-toggle button {
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--home-muted);
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 800;
  padding: 0.45rem 0.75rem;
}

.home-v2-gallery-toggle .home-v2-gallery-toggle-active {
  background: var(--home-primary);
  color: var(--home-primary-contrast);
}

.home-v2-gallery-image-img {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 120px;
  object-fit: cover;
  border-radius: 0.85rem;
}

.home-v2-gallery-image-empty {
  min-height: 120px;
}
`;
});

console.log("");
console.log("Done.");
console.log("Next:");
console.log("npx prisma db push");
console.log("npx prisma generate");
console.log("rm -rf .next");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");