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

function formatFileSize(sizeBytes: number): string {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${Math.round(sizeBytes / 1024)} KB`;

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
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
    const incomingFiles = Array.from(files);
    const combinedFiles = [...selectedFiles, ...incomingFiles];

    const uniqueFiles = combinedFiles.filter((file, index, array) => {
      const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
      return (
          array.findIndex(
              (candidate) =>
                  `${candidate.name}-${candidate.size}-${candidate.lastModified}` === fileKey,
          ) === index
      );
    });

    setSelectedFiles(uniqueFiles.slice(0, 40));
  }

  function removeFile(index: number) {
    setSelectedFiles((current) =>
        current.filter((_file, fileIndex) => fileIndex !== index),
    );
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

    if (selectedFiles.length === 0) {
      setStatus("error");
      setError("Vælg mindst ét billede.");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("images", file));

    setIsSaving(true);
    setStatus("idle");
    setError(null);

    try {
      const response = await fetch(`/${clubSlug}/galleri/${albumSlug}/upload`, {
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
      setError(
          uploadError instanceof Error
              ? uploadError.message
              : "Billederne kunne ikke uploades.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
      <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-[var(--public-card-border)] bg-[var(--public-card)] p-5 shadow-[var(--public-card-shadow)] sm:p-6"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--public-text)]">
              Tilføj billeder
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-[var(--public-text-muted)]">
              Vælg flere billeder på én gang eller træk dem ind i feltet.
            </p>
          </div>

          {selectedFiles.length > 0 ? (
              <div className="rounded-full bg-[var(--public-primary-soft)] px-3 py-1 text-sm font-bold text-[var(--public-primary)]">
                {selectedFiles.length} valgt
              </div>
          ) : null}
        </div>

        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={[
              "mt-5 rounded-3xl border border-dashed p-5 transition sm:p-6",
              isDragging
                  ? "border-[var(--public-primary)] bg-[var(--public-primary-soft)]"
                  : "border-[var(--public-card-border)] bg-[var(--public-surface)]",
            ].join(" ")}
        >
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--public-primary-soft)] text-xl font-bold text-[var(--public-primary)]">
              +
            </div>

            <div>
              <p className="text-sm font-bold text-[var(--public-text)]">
                Træk billeder hertil
              </p>
              <p className="mt-1 text-sm text-[var(--public-text-muted)]">
                eller vælg fra computer/telefon
              </p>
            </div>

            <label
                htmlFor="gallery-add-images"
                className="cursor-pointer rounded-xl bg-[var(--public-primary)] px-5 py-2.5 text-sm font-bold text-[var(--public-primary-contrast)] shadow-sm transition hover:opacity-90"
            >
              Vælg billeder
            </label>

            <input
                id="gallery-add-images"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
                multiple
                onChange={(event) => {
                  if (event.target.files) addFiles(event.target.files);
                  event.currentTarget.value = "";
                }}
                className="sr-only"
            />

            <p className="text-xs text-[var(--public-text-muted)]">
              JPG, PNG, WebP, HEIC og HEIF · maks 40 billeder
            </p>
          </div>
        </div>

        {selectedFiles.length > 0 ? (
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {selectedFiles.map((file, index) => (
                  <div
                      key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[var(--public-text)]">
                        {file.name}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--public-text-muted)]">
                        {formatFileSize(file.size)}
                      </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="shrink-0 rounded-xl border border-[var(--public-card-border)] px-3 py-2 text-xs font-bold text-[var(--public-text-muted)] transition hover:text-[var(--public-primary)]"
                    >
                      Fjern
                    </button>
                  </div>
              ))}
            </div>
        ) : null}

        {status === "success" ? (
            <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-700">
              Billederne er tilføjet.
            </div>
        ) : null}

        {status === "error" && error ? (
            <div className="mt-5 public-alert">{error}</div>
        ) : null}

        <div className="mt-6 flex justify-end">
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