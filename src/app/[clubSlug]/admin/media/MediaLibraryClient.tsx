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
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${Math.round(sizeBytes / 1024)} KB`;

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
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
      const response = await fetch(`/${clubSlug}/admin/media/upload`, {
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
        className="admin-card"
      >
        <div className="mb-6">
          <h2 className="admin-section-title">
            Upload billede
          </h2>
          <p className="admin-muted">
            Tilladte filtyper: JPG, PNG, WebP, HEIC og HEIF. Upload maks 25 MB. Billedet gemmes optimeret som WebP.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="file" className="admin-form-label">
              Billede
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
              required
              className="admin-file-input"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="title" className="admin-form-label">
              Titel
            </label>
            <input
              id="title"
              name="title"
              placeholder="Fx Adgangsvej til pladsen"
              className="admin-input"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="altText" className="admin-form-label">
              Beskrivelse / alt-tekst
            </label>
            <input
              id="altText"
              name="altText"
              placeholder="Kort beskrivelse af billedet"
              className="admin-input"
            />
          </div>
        </div>

        {uploadStatus === "success" ? (
          <div className="admin-alert admin-alert-success mt-5">
            Billedet er uploadet.
          </div>
        ) : null}

        {uploadStatus === "error" && error ? (
          <div className="admin-alert admin-alert-danger mt-5">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isUploading}
            className="admin-btn admin-btn-primary"
          >
            {isUploading ? "Uploader..." : "Upload billede"}
          </button>
        </div>
      </form>

      <section className="admin-card admin-media-library-panel">
        <div className="admin-media-library-header">
          <div>
            <h2 className="admin-section-title">
              Billeder
            </h2>
            <p className="admin-muted">
              {assets.length} aktive billeder i biblioteket.
            </p>
          </div>
        </div>

        {assets.length > 0 ? (
          <div className="admin-media-library-grid">
            {assets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => setSelectedAsset(asset)}
                className="admin-media-asset-card group"
              >
                <div className="admin-media-asset-thumb">
                  <img
                    src={asset.publicUrl}
                    alt={asset.altText || asset.title || asset.originalName}
                    className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                  />

                  <div className="admin-media-asset-overlay">
                    <div className="admin-media-asset-overlay-content">
                      <p className="admin-media-asset-overlay-text">
                        Åbn detaljer
                      </p>
                    </div>
                  </div>
                </div>

                <div className="admin-media-asset-card-body">
                  <h3 className="admin-media-asset-card-title">
                    {asset.title || asset.originalName}
                  </h3>
                  <p className="admin-media-asset-card-meta">
                    {formatFileSize(asset.sizeBytes)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="admin-card admin-muted p-8 text-center">
            Der er endnu ikke uploadet billeder.
          </div>
        )}
      </section>

      {selectedAsset ? (
        <div
          className="admin-media-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedAsset(null)}
        >
          <div
            className="admin-media-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-media-modal-image-pane">
              <img
                src={selectedAsset.publicUrl}
                alt={selectedAsset.altText || selectedAsset.title || selectedAsset.originalName}
                className="admin-media-modal-image"
              />
            </div>

            <div className="admin-media-modal-panel">
              <div className="admin-media-modal-header">
                <div className="admin-media-modal-titleblock">
                  <h2 className="admin-media-modal-title">
                    {selectedAsset.title || selectedAsset.originalName}
                  </h2>
                  <p className="admin-media-modal-subtitle">
                    {selectedAsset.originalName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAsset(null)}
                  className="admin-btn"
                >
                  Luk
                </button>
              </div>

              <div className="admin-media-detail-grid">
                <div className="admin-meta-box">
                  <span className="admin-meta-label">
                    Type
                  </span>
                  <span className="admin-meta-value">
                    {selectedAsset.mimeType}
                  </span>
                </div>

                <div className="admin-meta-box">
                  <span className="admin-meta-label">
                    Størrelse
                  </span>
                  <span className="admin-meta-value">
                    {formatFileSize(selectedAsset.sizeBytes)}
                  </span>
                </div>

                <div className="admin-meta-box col-span-2">
                  <span className="admin-meta-label">
                    Uploadet
                  </span>
                  <span className="admin-meta-value">
                    {formatDate(selectedAsset.createdAt)}
                  </span>
                </div>

                {selectedAsset.altText ? (
                  <div className="admin-meta-box col-span-2">
                    <span className="admin-meta-label">
                      Beskrivelse
                    </span>
                    <span className="admin-meta-value">
                      {selectedAsset.altText}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="admin-code-box admin-media-url-box">
                <p className="admin-meta-label mb-2">
                  Public URL
                </p>
                <code className="admin-code-text">
                  {selectedAsset.publicUrl}
                </code>
              </div>

              <div className="admin-media-modal-actions">
                <button
                  type="button"
                  onClick={() => copyUrl(selectedAsset.publicUrl)}
                  className="admin-btn"
                >
                  {copiedUrl === selectedAsset.publicUrl ? "Kopieret" : "Kopiér URL"}
                </button>

                <a
                  href={selectedAsset.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-btn"
                >
                  Åbn
                </a>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(selectedAsset.id)}
                  className="admin-btn admin-btn-danger"
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
