import fs from "fs";
import path from "path";

const root = process.cwd();

function writeFile(relativePath, content) {
    const absolutePath = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
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
`,
);

writeFile(
    "src/app/[clubSlug]/galleri/nyt/NewGalleryForm.tsx",
    `
"use client";

import { DragEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface NewGalleryFormProps {
  clubSlug: string;
}

interface UploadResult {
  success: boolean;
  error?: string;
  galleryUrl?: string;
}

interface SelectedGalleryFile {
  id: string;
  file: File;
  previewUrl: string;
}

function createFileId(file: File): string {
  return \`\${file.name}-\${file.size}-\${file.lastModified}\`;
}

function uniqueFiles(files: SelectedGalleryFile[]): SelectedGalleryFile[] {
  const seen = new Set<string>();

  return files.filter((file) => {
    if (seen.has(file.id)) {
      return false;
    }

    seen.add(file.id);
    return true;
  });
}

export default function NewGalleryForm({ clubSlug }: NewGalleryFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<SelectedGalleryFile[]>([]);
  const [coverFileId, setCoverFileId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addFiles(files: FileList | File[]) {
    const incoming = Array.from(files).map((file) => ({
      id: createFileId(file),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedFiles((current) => {
      const next = uniqueFiles([...current, ...incoming]).slice(0, 40);

      if (!coverFileId && next.length > 0) {
        setCoverFileId(next[0].id);
      }

      return next;
    });
  }

  function removeFile(fileId: string) {
    setSelectedFiles((current) => {
      const fileToRemove = current.find((file) => file.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }

      const next = current.filter((file) => file.id !== fileId);

      if (coverFileId === fileId) {
        setCoverFileId(next[0]?.id ?? null);
      }

      return next;
    });
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

    selectedFiles.forEach((selectedFile) => {
      formData.append("images", selectedFile.file);
    });

    const coverIndex = Math.max(
      selectedFiles.findIndex((selectedFile) => selectedFile.id === coverFileId),
      0,
    );

    formData.set("coverImageIndex", String(coverIndex));

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

  useEffect(() => {
    return () => {
      selectedFiles.forEach((selectedFile) => {
        URL.revokeObjectURL(selectedFile.previewUrl);
      });
    };
  }, []);

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
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[var(--public-text)]">
              Vælg coverbillede
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {selectedFiles.map((selectedFile) => {
                const isCover = selectedFile.id === coverFileId;

                return (
                  <div
                    key={selectedFile.id}
                    className={[
                      "overflow-hidden rounded-2xl border bg-[var(--public-surface)] text-sm text-[var(--public-text)]",
                      isCover ? "border-[var(--public-primary)] ring-2 ring-[var(--public-primary-soft)]" : "border-[var(--public-card-border)]",
                    ].join(" ")}
                  >
                    <div className="aspect-square bg-[var(--public-surface)]">
                      <img
                        src={selectedFile.previewUrl}
                        alt={selectedFile.file.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="space-y-2 p-3">
                      <p className="truncate font-semibold">{selectedFile.file.name}</p>

                      <button
                        type="button"
                        onClick={() => setCoverFileId(selectedFile.id)}
                        className="w-full rounded-xl bg-[var(--public-primary-soft)] px-3 py-2 text-xs font-bold text-[var(--public-primary)]"
                      >
                        {isCover ? "Valgt cover" : "Brug som cover"}
                      </button>

                      <button
                        type="button"
                        onClick={() => removeFile(selectedFile.id)}
                        className="w-full rounded-xl border border-[var(--public-card-border)] px-3 py-2 text-xs font-bold text-[var(--public-text-muted)]"
                      >
                        Fjern
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
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

patchFile("src/app/[clubSlug]/galleri/nyt/upload/route.ts", (current) => {
    let next = current;

    next = next.replace(
        `const visibility = normalizeVisibility(getText(formData, "visibility"));
    const files = getFiles(formData, "images");`,
        `const visibility = normalizeVisibility(getText(formData, "visibility"));
    const coverImageIndex = Number.parseInt(getText(formData, "coverImageIndex"), 10);
    const files = getFiles(formData, "images");`,
    );

    next = next.replace(
        `visibility,
      files,
      memberProfileId,`,
        `visibility,
      files,
      coverImageIndex,
      memberProfileId,`,
    );

    return next;
});

writeFile(
    "src/components/gallery/GalleryAddImagesForm.tsx",
    `
"use client";

import { DragEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

interface GalleryAddImagesFormProps {
  clubSlug: string;
  albumSlug: string;
}

interface UploadResult {
  success: boolean;
  error?: string;
}

export default function GalleryAddImagesForm({
  clubSlug,
  albumSlug,
}: GalleryAddImagesFormProps) {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function addFiles(files: FileList | File[]) {
    setSelectedFiles((current) => [...current, ...Array.from(files)].slice(0, 40));
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

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("images", file));

    setIsSaving(true);
    setStatus("idle");
    setError(null);

    try {
      const response = await fetch(\`/\${clubSlug}/galleri/\${albumSlug}/upload\`, {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as UploadResult;

      if (!response.ok || !result.success) {
        setStatus("error");
        setError(result.error || "Billederne kunne ikke uploades.");
        return;
      }

      setSelectedFiles([]);
      setStatus("success");
      router.refresh();
      setTimeout(() => setStatus("idle"), 3000);
    } catch (uploadError) {
      setStatus("error");
      setError(uploadError instanceof Error ? uploadError.message : "Billederne kunne ikke uploades.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-[var(--public-card-border)] bg-[var(--public-card)] p-5 shadow-[var(--public-card-shadow)] sm:p-6"
    >
      <h2 className="text-xl font-bold text-[var(--public-text)]">
        Tilføj billeder til galleriet
      </h2>
      <p className="mt-2 text-sm text-[var(--public-text-muted)]">
        Alle medlemmer kan tilføje billeder til eksisterende gallerier.
      </p>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          "mt-4 rounded-3xl border border-dashed p-6 text-center transition",
          isDragging
            ? "border-[var(--public-primary)] bg-[var(--public-primary-soft)]"
            : "border-[var(--public-card-border)] bg-[var(--public-surface)]",
        ].join(" ")}
      >
        <input
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
          Vælg flere billeder eller træk dem hertil.
        </p>
      </div>

      {selectedFiles.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {selectedFiles.map((file, index) => (
            <div
              key={\`\${file.name}-\${file.size}-\${file.lastModified}-\${index}\`}
              className="rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-3 text-sm text-[var(--public-text)]"
            >
              <p className="truncate font-semibold">{file.name}</p>
              <button
                type="button"
                onClick={() => setSelectedFiles((current) => current.filter((_file, fileIndex) => fileIndex !== index))}
                className="mt-2 text-xs font-bold text-[var(--public-primary)]"
              >
                Fjern
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {status === "success" ? (
        <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-700">
          Billederne er tilføjet.
        </div>
      ) : null}

      {status === "error" && error ? (
        <div className="mt-4 public-alert">
          {error}
        </div>
      ) : null}

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={isSaving || selectedFiles.length === 0}
          className="public-primary-button disabled:opacity-60"
        >
          {isSaving ? "Uploader..." : "Tilføj billeder"}
        </button>
      </div>
    </form>
  );
}
`,
);

writeFile(
    "src/app/[clubSlug]/galleri/[albumSlug]/upload/route.ts",
    `
import { NextResponse } from "next/server";
import { getServerViewerForClub } from "../../../../../lib/auth/viewer";
import { addMemberImagesToGallery } from "../../../../../lib/gallery/galleryMemberService";
import { getMemberProfileId } from "../../../../../lib/members/memberProfileService";
import { requireClubBySlug } from "../../../../../lib/tenancy/tenantService";

interface RouteContext {
  params: Promise<{
    clubSlug: string;
    albumSlug: string;
  }>;
}

function getFiles(formData: FormData, key: string): File[] {
  return formData
    .getAll(key)
    .filter((value): value is File => value instanceof File && value.size > 0);
}

export async function POST(request: Request, context: RouteContext) {
  const { clubSlug, albumSlug } = await context.params;

  try {
    const club = await requireClubBySlug(clubSlug);
    const viewer = await getServerViewerForClub(club.id);

    if (!viewer.isMember || !viewer.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Du skal være logget ind som medlem for at tilføje billeder.",
        },
        { status: 403 },
      );
    }

    const memberProfileId = await getMemberProfileId(club.id, viewer.userId);

    if (!memberProfileId) {
      return NextResponse.json(
        {
          success: false,
          error: "Kunne ikke finde din medlemsprofil.",
        },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const files = getFiles(formData, "images");

    await addMemberImagesToGallery({
      clubId: club.id,
      clubSlug,
      albumSlug,
      files,
      memberProfileId,
      memberName: viewer.name || null,
      memberEmail: viewer.email || null,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Billederne kunne ikke uploades.",
      },
      { status: 500 },
    );
  }
}
`,
);

patchFile("src/app/[clubSlug]/galleri/[albumSlug]/page.tsx", (current) => {
    let next = current;

    if (!next.includes("GalleryAddImagesForm")) {
        next = next.replace(
            `import GalleryLightbox from "../../../../components/gallery/GalleryLightbox";`,
            `import GalleryLightbox from "../../../../components/gallery/GalleryLightbox";
import GalleryAddImagesForm from "../../../../components/gallery/GalleryAddImagesForm";`,
        );
    }

    if (!next.includes("<GalleryAddImagesForm")) {
        next = next.replace(
            `{album.images.length > 0 ? (`,
            `{viewer.isMember ? (
        <div className="mb-6">
          <GalleryAddImagesForm clubSlug={clubSlug} albumSlug={albumSlug} />
        </div>
      ) : null}

      {album.images.length > 0 ? (`,
        );
    }

    return next;
});

writeFile(
    "src/lib/admin/galleryAdminActions.ts",
    `
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
});

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function revalidateGalleryPaths(clubSlug: string, albumId: string) {
  revalidatePath(\`/\${clubSlug}/admin/galleri\`);
  revalidatePath(\`/\${clubSlug}/admin/galleri/\${albumId}\`);
  revalidatePath(\`/\${clubSlug}/galleri\`);
  revalidatePath(\`/\${clubSlug}\`);
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
    \`/\${clubSlug}/admin/galleri/\${albumId}\`,
  );

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

  revalidateGalleryPaths(clubSlug, albumId);
  redirect(\`/\${clubSlug}/admin/galleri/\${albumId}?saved=1\`);
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
    \`/\${clubSlug}/admin/galleri/\${albumId}\`,
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
  redirect(\`/\${clubSlug}/admin/galleri/\${albumId}?saved=1\`);
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
    \`/\${clubSlug}/admin/galleri/\${albumId}\`,
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
  redirect(\`/\${clubSlug}/admin/galleri/\${albumId}?saved=1\`);
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
    \`/\${clubSlug}/admin/galleri/\${albumId}\`,
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
  redirect(\`/\${clubSlug}/admin/galleri/\${albumId}?saved=1\`);
}
`,
);

patchFile("src/app/[clubSlug]/admin/galleri/[albumId]/page.tsx", (current) => {
    let next = current;

    next = next.replace(
        `params: Promise<{
    clubSlug: string;
    albumId: string;
  }>;`,
        `params: Promise<{
    clubSlug: string;
    albumId: string;
  }>;
  searchParams?: Promise<{
    saved?: string;
  }>;`,
    );

    next = next.replace(
        `export default async function AdminGalleryDetailPage({ params }: PageProps) {
  const { clubSlug, albumId } = await params;`,
        `export default async function AdminGalleryDetailPage({ params, searchParams }: PageProps) {
  const { clubSlug, albumId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const wasSaved = resolvedSearchParams.saved === "1";`,
    );

    if (!next.includes("Galleriet er gemt.")) {
        next = next.replace(
            `<form action={updateAction} className="admin-card" style={{ marginBottom: "32px", padding: "24px" }}>`,
            `{wasSaved ? (
          <div
            style={{
              marginBottom: "24px",
              border: "1px solid rgba(16,185,129,0.25)",
              background: "rgba(16,185,129,0.12)",
              color: "#86efac",
              borderRadius: "12px",
              padding: "14px 16px",
              fontWeight: 700,
            }}
          >
            Galleriet er gemt.
          </div>
        ) : null}

        <form action={updateAction} className="admin-card" style={{ marginBottom: "32px", padding: "24px" }}>`,
        );
    }

    return next;
});

console.log("");
console.log("Done.");
console.log("Next:");
console.log("rm -rf .next");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");