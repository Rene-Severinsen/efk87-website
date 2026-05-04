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
        /model GalleryAlbum \{([\s\S]*?)createdAt\s+DateTime\s+@default\(now\(\)\)/,
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
    "src/lib/gallery/galleryImageStorageService.ts",
    `
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const allowedImageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const outputMimeType = "image/webp";
const outputExtension = ".webp";
const maxUploadSizeBytes = 25 * 1024 * 1024;
const maxLongestEdgePx = 2400;
const webpQuality = 85;

export interface StoredGalleryImage {
  originalName: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageProvider: "LOCAL";
  storageKey: string;
  publicUrl: string;
}

async function normalizeImageToWebp(file: File): Promise<Buffer> {
  const inputBuffer = Buffer.from(await file.arrayBuffer());

  try {
    return await sharp(inputBuffer, {
      failOn: "error",
    })
      .rotate()
      .resize({
        width: maxLongestEdgePx,
        height: maxLongestEdgePx,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: webpQuality,
      })
      .toBuffer();
  } catch {
    const message =
      file.type === "image/heic" || file.type === "image/heif"
        ? "HEIC/HEIF kunne ikke behandles på denne installation. Prøv at uploade som JPG."
        : "Billedet kunne ikke behandles.";

    throw new Error(message);
  }
}

export async function storeGalleryImageFile({
  clubSlug,
  albumId,
  file,
}: {
  clubSlug: string;
  albumId: string;
  file: File;
}): Promise<StoredGalleryImage> {
  if (!allowedImageMimeTypes.has(file.type)) {
    throw new Error("Kun JPG, PNG, WebP, HEIC og HEIF kan uploades.");
  }

  if (file.size > maxUploadSizeBytes) {
    throw new Error("Billedet er for stort. Maksimal uploadstørrelse er 25 MB.");
  }

  const outputBuffer = await normalizeImageToWebp(file);
  const randomName = crypto.randomBytes(16).toString("hex");
  const fileName = \`\${randomName}\${outputExtension}\`;

  const publicRelativeDirectory = \`uploads/\${clubSlug}/gallery/\${albumId}\`;
  const storageKey = \`\${publicRelativeDirectory}/\${fileName}\`;
  const uploadDirectory = path.join(process.cwd(), "public", publicRelativeDirectory);
  const absoluteFilePath = path.join(uploadDirectory, fileName);
  const publicUrl = \`/\${storageKey}\`;

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(absoluteFilePath, outputBuffer);

  return {
    originalName: file.name,
    fileName,
    mimeType: outputMimeType,
    sizeBytes: outputBuffer.length,
    storageProvider: "LOCAL",
    storageKey,
    publicUrl,
  };
}

export async function deleteLocalGalleryImageFile(storageKey: string | null): Promise<void> {
  if (!storageKey || !storageKey.startsWith("uploads/")) {
    return;
  }

  const absoluteFilePath = path.join(process.cwd(), "public", storageKey);

  try {
    await unlink(absoluteFilePath);
  } catch {
    // DB status is source of truth in V1.
  }
}
`,
);

writeFile(
    "src/lib/gallery/galleryMemberService.ts",
    `
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
    .replace(/[\\u0300-\\u036f]/g, "")
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
    candidate = \`\${base}-\${counter}\`;
    counter += 1;
  }

  return candidate;
}

export async function createMemberGalleryWithImages({
  clubId,
  clubSlug,
  title,
  description,
  visibility,
  files,
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

  const coverImageUrl = storedImages[0]?.publicUrl ?? null;

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
`,
);

writeFile(
    "src/app/[clubSlug]/galleri/nyt/page.tsx",
    `
import { notFound, redirect } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { getServerViewerForClub } from "../../../../lib/auth/viewer";
import { publicRoutes } from "../../../../lib/publicRoutes";
import NewGalleryForm from "./NewGalleryForm";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { resolvePublicPageForClub } from "../../../../lib/publicSite/publicPageRoute";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function NewGalleryPage({ params }: PageProps) {
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

  const viewer = await getServerViewerForClub(club.id);

  if (!viewer.isMember) {
    redirect(publicRoutes.login(clubSlug));
  }

  const {
    theme,
    footerData,
    navigationItems,
    actionItems,
    publicSettings,
  } = await resolvePublicPageForClub(clubSlug, "galleri");

  return (
    <ThemedClubPageShell
      clubSlug={clubSlug}
      clubName={club.settings?.shortName || club.name}
      clubDisplayName={publicSettings?.displayName || club.settings?.displayName || club.name}
      theme={theme}
      publicThemeMode={publicSettings?.publicThemeMode}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title="Opret galleri"
      subtitle="Del billeder fra klubben, flyvning og arrangementer."
      currentPath={publicRoutes.gallery(clubSlug)}
      maxWidth="960px"
    >
      <NewGalleryForm clubSlug={clubSlug} />
    </ThemedClubPageShell>
  );
}
`,
);

writeFile(
    "src/app/[clubSlug]/galleri/nyt/NewGalleryForm.tsx",
    `
"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface NewGalleryFormProps {
  clubSlug: string;
}

interface UploadResult {
  success: boolean;
  error?: string;
  galleryUrl?: string;
}

export default function NewGalleryForm({ clubSlug }: NewGalleryFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;

    setSelectedFiles(Array.from(files));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSaving(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

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
        <legend className="public-label">
          Synlighed
        </legend>

        <label className="flex items-center gap-3 rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-4 text-[var(--public-text)]">
          <input
            type="radio"
            name="visibility"
            value="PUBLIC"
            defaultChecked
            className="h-4 w-4"
          />
          <span>
            <span className="block font-semibold">Offentligt</span>
            <span className="block text-sm text-[var(--public-text-muted)]">
              Kan ses af alle besøgende.
            </span>
          </span>
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-4 text-[var(--public-text)]">
          <input
            type="radio"
            name="visibility"
            value="MEMBERS_ONLY"
            className="h-4 w-4"
          />
          <span>
            <span className="block font-semibold">Kun for medlemmer</span>
            <span className="block text-sm text-[var(--public-text-muted)]">
              Kræver login som medlem.
            </span>
          </span>
        </label>
      </fieldset>

      <div className="space-y-2">
        <label htmlFor="images" className="public-label">
          Billeder
        </label>

        <div className="rounded-3xl border border-dashed border-[var(--public-card-border)] bg-[var(--public-surface)] p-6 text-center">
          <input
            id="images"
            name="images"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
            multiple
            required
            onChange={(event) => handleFiles(event.target.files)}
            className="mx-auto block max-w-full text-sm text-[var(--public-text)] file:mr-4 file:rounded-xl file:border-0 file:bg-[var(--public-primary)] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
          />

          <p className="mt-3 text-sm text-[var(--public-text-muted)]">
            Du kan vælge flere billeder på én gang. Maks 40 billeder pr. gallerioprettelse.
          </p>
        </div>

        {selectedFiles.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {selectedFiles.map((file) => (
              <div
                key={\`\${file.name}-\${file.size}\`}
                className="rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-3 text-sm text-[var(--public-text)]"
              >
                <p className="truncate font-semibold">{file.name}</p>
                <p className="mt-1 text-xs text-[var(--public-text-muted)]">
                  {Math.round(file.size / 1024)} KB
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="public-alert">
          {error}
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="public-primary-button disabled:opacity-60"
        >
          {isSaving ? "Opretter..." : "Opret galleri"}
        </button>
      </div>
    </form>
  );
}
`,
);

writeFile(
    "src/app/[clubSlug]/galleri/nyt/upload/route.ts",
    `
import { NextResponse } from "next/server";
import { PublicSurfaceVisibility } from "../../../../../generated/prisma";
import { getServerViewerForClub } from "../../../../../lib/auth/viewer";
import { createMemberGalleryWithImages } from "../../../../../lib/gallery/galleryMemberService";
import { publicRoutes } from "../../../../../lib/publicRoutes";
import { requireClubBySlug } from "../../../../../lib/tenancy/tenantService";

interface RouteContext {
  params: Promise<{
    clubSlug: string;
  }>;
}

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getFiles(formData: FormData, key: string): File[] {
  return formData
    .getAll(key)
    .filter((value): value is File => value instanceof File && value.size > 0);
}

function normalizeVisibility(value: string): PublicSurfaceVisibility {
  return value === PublicSurfaceVisibility.MEMBERS_ONLY
    ? PublicSurfaceVisibility.MEMBERS_ONLY
    : PublicSurfaceVisibility.PUBLIC;
}

export async function POST(request: Request, context: RouteContext) {
  const { clubSlug } = await context.params;

  try {
    const club = await requireClubBySlug(clubSlug);
    const viewer = await getServerViewerForClub(club.id);

    if (!viewer.isMember || !viewer.memberProfileId) {
      return NextResponse.json(
        {
          success: false,
          error: "Du skal være logget ind som medlem for at oprette galleri.",
        },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const title = getText(formData, "title");
    const description = getText(formData, "description");
    const visibility = normalizeVisibility(getText(formData, "visibility"));
    const files = getFiles(formData, "images");

    const gallery = await createMemberGalleryWithImages({
      clubId: club.id,
      clubSlug,
      title,
      description,
      visibility,
      files,
      memberProfileId: viewer.memberProfileId,
      memberName: viewer.name || null,
      memberEmail: viewer.email || null,
    });

    return NextResponse.json({
      success: true,
      galleryUrl: publicRoutes.galleryAlbum(clubSlug, gallery.slug),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Galleriet kunne ikke oprettes.",
      },
      { status: 500 },
    );
  }
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

patchFile("src/app/[clubSlug]/galleri/page.tsx", (current) => {
    let next = current;

    if (!next.includes("Opret galleri")) {
        next = next.replace(
            `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">`,
            `{viewer.isMember ? (
        <div className="mb-6 flex justify-end">
          <Link href={publicRoutes.galleryNew(clubSlug)} className="public-primary-button">
            Opret galleri
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">`,
        );
    }

    next = next.replaceAll("var(--club-accent)", "var(--public-primary)");

    return next;
});

patchFile("src/lib/admin/galleryAdminService.ts", (current) => {
    let next = current;

    if (!next.includes("createdByName: string | null")) {
        next = next.replace(
            `updatedAt: Date;`,
            `updatedAt: Date;
    createdByName: string | null;
    createdByEmail: string | null;
    slug: string;`,
        );
    }

    next = next.replace(
        `title: album.title,
      status: album.status,`,
        `title: album.title,
      slug: album.slug,
      status: album.status,`,
    );

    next = next.replace(
        `updatedAt: album.updatedAt,`,
        `updatedAt: album.updatedAt,
      createdByName: album.createdByName,
      createdByEmail: album.createdByEmail,`,
    );

    return next;
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