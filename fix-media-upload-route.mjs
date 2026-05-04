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

writeFile(
    "src/app/[clubSlug]/admin/media/upload/route.ts",
    `
import { NextResponse } from "next/server";
import { requireClubAdminForClub } from "../../../../../lib/auth/adminAccessGuards";
import { uploadClubMediaAsset } from "../../../../../lib/media/mediaStorageService";
import { requireClubBySlug } from "../../../../../lib/tenancy/tenantService";

interface RouteContext {
  params: Promise<{
    clubSlug: string;
  }>;
}

function getText(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  return typeof value === "string" ? value : null;
}

export async function POST(request: Request, context: RouteContext) {
  const { clubSlug } = await context.params;

  try {
    const club = await requireClubBySlug(clubSlug);
    const viewer = await requireClubAdminForClub(
      club.id,
      clubSlug,
      \`/\${clubSlug}/admin/media\`,
    );

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "Vælg et billede der skal uploades.",
        },
        { status: 400 },
      );
    }

    await uploadClubMediaAsset({
      clubId: club.id,
      clubSlug,
      file,
      title: getText(formData, "title"),
      altText: getText(formData, "altText"),
      uploadedByName: viewer.name || null,
      uploadedByEmail: viewer.email || null,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Billedet kunne ikke uploades.",
      },
      { status: 500 },
    );
  }
}
`,
);

writeFile(
    "src/app/[clubSlug]/admin/media/MediaLibraryClient.tsx",
    `
"use client";

import { FormEvent, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deactivateClubMediaAction } from "../../../../lib/admin/mediaActions";
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
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsUploading(true);
    setUploadStatus("idle");
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch(\`/\${clubSlug}/admin/media/upload\`, {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: string;
      };

      if (!response.ok || !result.success) {
        setUploadStatus("error");
        setError(result.error || "Billedet kunne ikke uploades.");
        return;
      }

      setUploadStatus("success");
      formRef.current?.reset();
      router.refresh();
    } catch (uploadError) {
      setUploadStatus("error");
      setError(uploadError instanceof Error ? uploadError.message : "Billedet kunne ikke uploades.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleDelete(assetId: string) {
    startTransition(async () => {
      await deactivateClubMediaAction(clubSlug, assetId);
      router.refresh();
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
        ref={formRef}
        onSubmit={handleUpload}
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
            disabled={isUploading}
            className="rounded-xl bg-sky-600 px-8 py-3 font-bold text-white shadow-lg shadow-sky-900/20 transition-all hover:bg-sky-500 disabled:bg-slate-700 disabled:shadow-none"
          >
            {isUploading ? "Uploader..." : "Upload billede"}
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

console.log("");
console.log("Done.");
console.log("Next:");
console.log("rm -rf .next");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");