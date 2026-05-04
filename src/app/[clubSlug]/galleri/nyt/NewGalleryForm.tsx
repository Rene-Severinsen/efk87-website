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
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function formatFileSize(sizeBytes: number): string {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${Math.round(sizeBytes / 1024)} KB`;

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
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
      const response = await fetch(`/${clubSlug}/galleri/nyt/upload`, {
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
      setError(
          uploadError instanceof Error
              ? uploadError.message
              : "Galleriet kunne ikke oprettes.",
      );
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
  }, [selectedFiles]);

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
          <label htmlFor="gallery-create-images" className="public-label">
            Billeder
          </label>

          <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={[
                "rounded-3xl border border-dashed p-5 transition sm:p-6",
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
                  htmlFor="gallery-create-images"
                  className="cursor-pointer rounded-xl bg-[var(--public-primary)] px-5 py-2.5 text-sm font-bold text-[var(--public-primary-contrast)] shadow-sm transition hover:opacity-90"
              >
                Vælg billeder
              </label>

              <input
                  id="gallery-create-images"
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
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--public-text)]">
                    Vælg coverbillede
                  </p>

                  <div className="rounded-full bg-[var(--public-primary-soft)] px-3 py-1 text-sm font-bold text-[var(--public-primary)]">
                    {selectedFiles.length} valgt
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {selectedFiles.map((selectedFile) => {
                    const isCover = selectedFile.id === coverFileId;

                    return (
                        <div
                            key={selectedFile.id}
                            className={[
                              "overflow-hidden rounded-2xl border bg-[var(--public-surface)] text-sm text-[var(--public-text)]",
                              isCover
                                  ? "border-[var(--public-primary)] ring-2 ring-[var(--public-primary-soft)]"
                                  : "border-[var(--public-card-border)]",
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
                            <div className="min-w-0">
                              <p className="truncate font-semibold">
                                {selectedFile.file.name}
                              </p>
                              <p className="mt-0.5 text-xs text-[var(--public-text-muted)]">
                                {formatFileSize(selectedFile.file.size)}
                              </p>
                            </div>

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
                                className="w-full rounded-xl border border-[var(--public-card-border)] px-3 py-2 text-xs font-bold text-[var(--public-text-muted)] transition hover:text-[var(--public-primary)]"
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
          <button
              type="submit"
              disabled={isSaving || selectedFiles.length === 0}
              className="public-primary-button disabled:opacity-60"
          >
            {isSaving ? "Opretter..." : "Opret galleri"}
          </button>
        </div>
      </form>
  );
}