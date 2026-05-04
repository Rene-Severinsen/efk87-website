import fs from "fs";
import path from "path";

const root = process.cwd();

function writeFile(relativePath, content) {
    const absolutePath = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content.trimStart(), "utf8");
    console.log(`Wrote ${relativePath}`);
}

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
  const [selectedAsset, setSelectedAsset] = useState<ClubMediaAssetDTO | null>(null);

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
      setSelectedAsset(null);
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
            Tilladte filtyper: JPG, PNG, WebP, HEIC og HEIF. Upload maks 25 MB. Billedet gemmes optimeret som WebP.
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
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
            {assets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => setSelectedAsset(asset)}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-[#121b2e]/80 text-left shadow-lg transition hover:border-sky-500/50 hover:bg-[#17233a]"
              >
                <div className="relative aspect-square bg-[#0f172a]">
                  <img
                    src={asset.publicUrl}
                    alt={asset.altText || asset.title || asset.originalName}
                    className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition group-hover:opacity-100">
                    <div className="w-full p-3">
                      <p className="text-xs font-bold text-white">
                        Åbn detaljer
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 p-3">
                  <h3 className="truncate text-sm font-bold text-white">
                    {asset.title || asset.originalName}
                  </h3>
                  <p className="truncate text-xs text-slate-400">
                    {formatFileSize(asset.sizeBytes)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-[#121b2e]/80 p-8 text-center text-slate-400">
            Der er endnu ikke uploadet billeder.
          </div>
        )}
      </section>

      {selectedAsset ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedAsset(null)}
        >
          <div
            className="grid max-h-[92vh] w-full max-w-6xl grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-[#0b1120] shadow-2xl lg:grid-cols-[1.25fr_0.75fr]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex min-h-[320px] items-center justify-center bg-black">
              <img
                src={selectedAsset.publicUrl}
                alt={selectedAsset.altText || selectedAsset.title || selectedAsset.originalName}
                className="max-h-[92vh] w-full object-contain"
              />
            </div>

            <div className="flex max-h-[92vh] flex-col overflow-y-auto p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-bold text-white">
                    {selectedAsset.title || selectedAsset.originalName}
                  </h2>
                  <p className="mt-1 truncate text-sm text-slate-400">
                    {selectedAsset.originalName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAsset(null)}
                  className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-bold text-white transition hover:bg-white/15"
                >
                  Luk
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm text-slate-400">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Type
                  </span>
                  <span className="mt-1 block font-semibold text-slate-200">
                    {selectedAsset.mimeType}
                  </span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Størrelse
                  </span>
                  <span className="mt-1 block font-semibold text-slate-200">
                    {formatFileSize(selectedAsset.sizeBytes)}
                  </span>
                </div>

                <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Uploadet
                  </span>
                  <span className="mt-1 block font-semibold text-slate-200">
                    {formatDate(selectedAsset.createdAt)}
                  </span>
                </div>

                {selectedAsset.altText ? (
                  <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Beskrivelse
                    </span>
                    <span className="mt-1 block text-slate-200">
                      {selectedAsset.altText}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-[#0f172a] p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Public URL
                </p>
                <code className="block break-all text-xs text-slate-300">
                  {selectedAsset.publicUrl}
                </code>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyUrl(selectedAsset.publicUrl)}
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15"
                >
                  {copiedUrl === selectedAsset.publicUrl ? "Kopieret" : "Kopiér URL"}
                </button>

                <a
                  href={selectedAsset.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15"
                >
                  Åbn
                </a>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(selectedAsset.id)}
                  className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-bold text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-50"
                >
                  Fjern
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
`,
);

console.log("");
console.log("Done.");
console.log("Next:");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");