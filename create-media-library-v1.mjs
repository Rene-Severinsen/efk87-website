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

    if (!next.includes("mediaAssets ClubMediaAsset[]")) {
        next = next.replace(
            /(model Club\s*{[\s\S]*?)(\n\s*financePage\s+ClubFinancePage\?)/,
            `$1
  mediaAssets ClubMediaAsset[]$2`,
        );
    }

    if (!next.includes("model ClubMediaAsset")) {
        next += `

model ClubMediaAsset {
  id String @id @default(cuid())

  clubId String

  title        String?
  altText      String?
  originalName String
  fileName     String
  mimeType     String
  sizeBytes    Int

  storageProvider String @default("LOCAL")
  storageKey      String
  publicUrl       String

  isActive Boolean @default(true)

  uploadedByName  String?
  uploadedByEmail String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  club Club @relation(fields: [clubId], references: [id], onDelete: Cascade)

  @@index([clubId, createdAt])
  @@index([clubId, isActive])
}
`;
    }

    return next;
});

writeFile(
    "src/lib/media/mediaTypes.ts",
    `
export interface ClubMediaAssetDTO {
  id: string;
  clubId: string;
  title: string | null;
  altText: string | null;
  originalName: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageProvider: string;
  storageKey: string;
  publicUrl: string;
  isActive: boolean;
  uploadedByName: string | null;
  uploadedByEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadClubMediaInput {
  clubId: string;
  clubSlug: string;
  file: File;
  title: string | null;
  altText: string | null;
  uploadedByName: string | null;
  uploadedByEmail: string | null;
}
`,
);

writeFile(
    "src/lib/media/mediaStorageService.ts",
    `
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import crypto from "crypto";
import prisma from "../db/prisma";
import { ClubMediaAssetDTO, UploadClubMediaInput } from "./mediaTypes";

const allowedImageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function sanitizeFileExtension(originalName: string, mimeType: string): string {
  const extension = path.extname(originalName).toLowerCase();

  if (extension && /^[a-z0-9.]+$/.test(extension)) {
    return extension;
  }

  switch (mimeType) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return "";
  }
}

function normalizeNullableText(value: string | null): string | null {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function toDto(asset: {
  id: string;
  clubId: string;
  title: string | null;
  altText: string | null;
  originalName: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageProvider: string;
  storageKey: string;
  publicUrl: string;
  isActive: boolean;
  uploadedByName: string | null;
  uploadedByEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ClubMediaAssetDTO {
  return {
    id: asset.id,
    clubId: asset.clubId,
    title: asset.title,
    altText: asset.altText,
    originalName: asset.originalName,
    fileName: asset.fileName,
    mimeType: asset.mimeType,
    sizeBytes: asset.sizeBytes,
    storageProvider: asset.storageProvider,
    storageKey: asset.storageKey,
    publicUrl: asset.publicUrl,
    isActive: asset.isActive,
    uploadedByName: asset.uploadedByName,
    uploadedByEmail: asset.uploadedByEmail,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
  };
}

export async function listClubMediaAssets(clubId: string): Promise<ClubMediaAssetDTO[]> {
  const assets = await prisma.clubMediaAsset.findMany({
    where: {
      clubId,
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return assets.map(toDto);
}

export async function uploadClubMediaAsset(
  input: UploadClubMediaInput,
): Promise<ClubMediaAssetDTO> {
  if (!allowedImageMimeTypes.has(input.file.type)) {
    throw new Error("Kun billedfiler kan uploades.");
  }

  const maxSizeBytes = 12 * 1024 * 1024;

  if (input.file.size > maxSizeBytes) {
    throw new Error("Billedet er for stort. Maksimal størrelse er 12 MB.");
  }

  const extension = sanitizeFileExtension(input.file.name, input.file.type);
  const randomName = crypto.randomBytes(16).toString("hex");
  const fileName = \`\${randomName}\${extension}\`;

  const publicRelativeDirectory = \`uploads/\${input.clubSlug}/media\`;
  const storageKey = \`\${publicRelativeDirectory}/\${fileName}\`;
  const uploadDirectory = path.join(process.cwd(), "public", publicRelativeDirectory);
  const absoluteFilePath = path.join(uploadDirectory, fileName);
  const publicUrl = \`/\${storageKey}\`;

  await mkdir(uploadDirectory, { recursive: true });

  const arrayBuffer = await input.file.arrayBuffer();
  await writeFile(absoluteFilePath, Buffer.from(arrayBuffer));

  const asset = await prisma.clubMediaAsset.create({
    data: {
      clubId: input.clubId,
      title: normalizeNullableText(input.title),
      altText: normalizeNullableText(input.altText),
      originalName: input.file.name,
      fileName,
      mimeType: input.file.type,
      sizeBytes: input.file.size,
      storageProvider: "LOCAL",
      storageKey,
      publicUrl,
      uploadedByName: normalizeNullableText(input.uploadedByName),
      uploadedByEmail: normalizeNullableText(input.uploadedByEmail),
    },
  });

  return toDto(asset);
}

export async function deactivateClubMediaAsset(
  clubId: string,
  assetId: string,
): Promise<void> {
  await prisma.clubMediaAsset.updateMany({
    where: {
      id: assetId,
      clubId,
    },
    data: {
      isActive: false,
    },
  });
}

export async function deleteLocalClubMediaAssetFile(
  storageKey: string,
): Promise<void> {
  if (!storageKey.startsWith("uploads/")) {
    return;
  }

  const absoluteFilePath = path.join(process.cwd(), "public", storageKey);

  try {
    await unlink(absoluteFilePath);
  } catch {
    // File may already be gone. DB deactivation is the source of truth for V1.
  }
}
`,
);

writeFile(
    "src/lib/admin/mediaActions.ts",
    `
"use server";

import { revalidatePath } from "next/cache";
import { requireClubAdminForClub } from "../auth/adminAccessGuards";
import {
  deactivateClubMediaAsset,
  uploadClubMediaAsset,
} from "../media/mediaStorageService";
import { requireClubBySlug } from "../tenancy/tenantService";

function getText(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  return typeof value === "string" ? value : null;
}

export async function uploadClubMediaAction(
  clubSlug: string,
  formData: FormData,
) {
  const club = await requireClubBySlug(clubSlug);
  const viewer = await requireClubAdminForClub(
    club.id,
    clubSlug,
    \`/\${clubSlug}/admin/media\`,
  );

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return {
      success: false,
      error: "Vælg et billede der skal uploades.",
    };
  }

  try {
    await uploadClubMediaAsset({
      clubId: club.id,
      clubSlug,
      file,
      title: getText(formData, "title"),
      altText: getText(formData, "altText"),
      uploadedByName: viewer.name || null,
      uploadedByEmail: viewer.email || null,
    });

    revalidatePath(\`/\${clubSlug}/admin/media\`);

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Billedet kunne ikke uploades.",
    };
  }
}

export async function deactivateClubMediaAction(
  clubSlug: string,
  assetId: string,
) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(
    club.id,
    clubSlug,
    \`/\${clubSlug}/admin/media\`,
  );

  await deactivateClubMediaAsset(club.id, assetId);

  revalidatePath(\`/\${clubSlug}/admin/media\`);

  return {
    success: true,
  };
}
`,
);

writeFile(
    "src/app/[clubSlug]/admin/media/page.tsx",
    `
import { notFound } from "next/navigation";
import AdminShell from "../../../../components/admin/AdminShell";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import { listClubMediaAssets } from "../../../../lib/media/mediaStorageService";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import MediaLibraryClient from "./MediaLibraryClient";

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

  const viewer = await requireClubAdminForClub(
    club.id,
    clubSlug,
    \`/\${clubSlug}/admin/media\`,
  );

  const assets = await listClubMediaAssets(club.id);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <div className="py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">
            Media
          </h1>
          <p className="max-w-3xl text-slate-400">
            Upload og administrér billeder til klubsite, galleri, artikler og fremtidige billedsektioner.
            V1 gemmer billeder lokalt. Storage kan senere skiftes til S3/Object Storage uden at ændre brugerfladen.
          </p>
        </div>

        <MediaLibraryClient
          clubSlug={clubSlug}
          assets={assets}
        />
      </div>
    </AdminShell>
  );
}
`,
);

writeFile(
    "src/app/[clubSlug]/admin/media/MediaLibraryClient.tsx",
    `
"use client";

import { useState, useTransition } from "react";
import {
  deactivateClubMediaAction,
  uploadClubMediaAction,
} from "../../../../lib/admin/mediaActions";
import { ClubMediaAssetDTO } from "../../../../lib/media/mediaTypes";

interface MediaLibraryClientProps {
  clubSlug: string;
  assets: ClubMediaAssetDTO[];
}

function formatFileSize(sizeBytes: number): string {
  if (sizeBytes < 1024) return \`\${sizeBytes} B\`;
  if (sizeBytes < 1024 * 1024) return \`\${Math.round(sizeBytes / 1024)} KB\`;

  return \`\${(sizeBytes / (1024 * 1024)).toFixed(1)} MB\`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("da-DK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function MediaLibraryClient({
  clubSlug,
  assets,
}: MediaLibraryClientProps) {
  const [isPending, startTransition] = useTransition();
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  async function handleUpload(formData: FormData) {
    setUploadStatus("idle");
    setError(null);

    const result = await uploadClubMediaAction(clubSlug, formData);

    if (result.success) {
      setUploadStatus("success");
      return;
    }

    setUploadStatus("error");
    setError(result.error || "Billedet kunne ikke uploades.");
  }

  function handleDelete(assetId: string) {
    startTransition(async () => {
      await deactivateClubMediaAction(clubSlug, assetId);
    });
  }

  function copyUrl(publicUrl: string) {
    navigator.clipboard.writeText(publicUrl);
    setCopiedUrl(publicUrl);
    setTimeout(() => setCopiedUrl(null), 1800);
  }

  return (
    <div className="space-y-8">
      <form
        action={handleUpload}
        className="rounded-3xl border border-white/10 bg-[#121b2e]/80 p-6 shadow-2xl backdrop-blur-md"
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">
            Upload billede
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Tilladte filtyper: JPG, PNG, WebP og GIF. Maks 12 MB.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="file" className="block text-sm font-medium text-slate-300">
              Billede
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              required
              className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-600 file:px-3 file:py-2 file:text-sm file:font-bold file:text-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-slate-300">
              Titel
            </label>
            <input
              id="title"
              name="title"
              placeholder="Fx Adgangsvej til pladsen"
              className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="altText" className="block text-sm font-medium text-slate-300">
              Beskrivelse / alt-tekst
            </label>
            <input
              id="altText"
              name="altText"
              placeholder="Kort beskrivelse af billedet"
              className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            />
          </div>
        </div>

        {uploadStatus === "success" ? (
          <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-400">
            Billedet er uploadet.
          </div>
        ) : null}

        {uploadStatus === "error" && error ? (
          <div className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-medium text-rose-400">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-sky-600 px-8 py-3 font-bold text-white shadow-lg shadow-sky-900/20 transition-all hover:bg-sky-500"
          >
            Upload billede
          </button>
        </div>
      </form>

      <section>
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              Billeder
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {assets.length} aktive billeder i biblioteket.
            </p>
          </div>
        </div>

        {assets.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {assets.map((asset) => (
              <article
                key={asset.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-[#121b2e]/80 shadow-2xl backdrop-blur-md"
              >
                <div className="aspect-[16/10] bg-[#0f172a]">
                  <img
                    src={asset.publicUrl}
                    alt={asset.altText || asset.title || asset.originalName}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <h3 className="truncate text-lg font-bold text-white">
                      {asset.title || asset.originalName}
                    </h3>
                    <p className="mt-1 truncate text-sm text-slate-400">
                      {asset.originalName}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
                    <div>
                      <span className="block font-semibold text-slate-300">Type</span>
                      {asset.mimeType}
                    </div>
                    <div>
                      <span className="block font-semibold text-slate-300">Størrelse</span>
                      {formatFileSize(asset.sizeBytes)}
                    </div>
                    <div className="col-span-2">
                      <span className="block font-semibold text-slate-300">Uploadet</span>
                      {formatDate(asset.createdAt)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#0f172a] p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Public URL
                    </p>
                    <code className="block break-all text-xs text-slate-300">
                      {asset.publicUrl}
                    </code>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyUrl(asset.publicUrl)}
                      className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15"
                    >
                      {copiedUrl === asset.publicUrl ? "Kopieret" : "Kopiér URL"}
                    </button>

                    <a
                      href={asset.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15"
                    >
                      Åbn
                    </a>

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDelete(asset.id)}
                      className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-bold text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-50"
                    >
                      Fjern
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-[#121b2e]/80 p-8 text-center text-slate-400">
            Der er endnu ikke uploadet billeder.
          </div>
        )}
      </section>
    </div>
  );
}
`,
);

patchFile("src/components/admin/AdminSidebar.tsx", (current) => {
    if (current.includes("/admin/media")) return current;

    return current.replace(
        /<a\s+href={`\/\$\{clubSlug\}\/admin\/galleri`}[\s\S]*?<\/a>/,
        (match) =>
            `<a
            href={\`/\${clubSlug}/admin/media\`}
            className={\`admin-sidebar-item \${pathname?.startsWith(\`/\${clubSlug}/admin/media\`) ? "active" : ""}\`}
          >
            Media
          </a>
          ${match}`,
    );
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