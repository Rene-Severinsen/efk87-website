"use client";

import { useMemo, useState } from "react";
import { ClubMediaAssetDTO } from "../../../lib/media/mediaTypes";

interface MediaUrlPickerProps {
  name: string;
  label: string;
  value: string | null;
  assets: ClubMediaAssetDTO[];
  placeholder?: string;
  hideUrlInput?: boolean;
  previewFit?: "cover" | "contain";
  compact?: boolean;
}

function formatFileSize(sizeBytes: number): string {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${Math.round(sizeBytes / 1024)} KB`;

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaUrlPicker({
  name,
  label,
  value,
  assets,
  placeholder = "Vælg billede fra Media eller indsæt URL",
  hideUrlInput = false,
  previewFit = "cover",
  compact = false,
}: MediaUrlPickerProps) {
  const [selectedUrl, setSelectedUrl] = useState(value ?? "");
  const [isOpen, setIsOpen] = useState(false);

  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.publicUrl === selectedUrl) ?? null,
    [assets, selectedUrl],
  );

  function selectAsset(publicUrl: string) {
    setSelectedUrl(publicUrl);
    setIsOpen(false);
  }

  function clearSelection() {
    setSelectedUrl("");
    setIsOpen(false);
  }

  const chooseButtonClass = compact
    ? "admin-btn admin-btn-primary admin-media-picker-button admin-media-picker-button--compact"
    : "admin-btn admin-btn-primary admin-media-picker-button";

  const inputClass = compact
    ? "admin-input admin-media-picker-input admin-media-picker-input--compact"
    : "admin-input admin-media-picker-input";

  const previewShellClass = compact
    ? "admin-media-preview admin-media-preview--compact"
    : "admin-media-preview";

  const previewMediaWrapClass = compact
    ? "admin-media-preview-frame admin-media-preview-frame--compact"
    : "admin-media-preview-frame";

  const previewImageClass =
    previewFit === "contain"
      ? compact
        ? "h-full w-full object-contain p-3"
        : "h-full w-full object-contain p-4"
      : "h-full w-full object-cover";

  return (
    <div className={compact ? "relative space-y-2" : "relative space-y-3"}>
      <label htmlFor={name} className="admin-form-label">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={chooseButtonClass}
      >
        Vælg billede fra Media
      </button>

      {!hideUrlInput ? (
        <input
          id={name}
          name={name}
          value={selectedUrl}
          onClick={() => setIsOpen(true)}
          onChange={(event) => setSelectedUrl(event.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />
      ) : (
        <input
          id={name}
          name={name}
          value={selectedUrl}
          onChange={() => {}}
          type="hidden"
        />
      )}

      {selectedUrl ? (
        <div className="flex flex-wrap gap-2">
          <a
            href={selectedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={compact ? "admin-btn admin-btn-compact" : "admin-btn"}
          >
            Åbn
          </a>

          <button
            type="button"
            onClick={clearSelection}
            className={
              compact
                ? "admin-btn admin-btn-danger admin-btn-compact"
                : "admin-btn admin-btn-danger"
            }
          >
            Ryd
          </button>
        </div>
      ) : null}

      {selectedAsset ? (
        <div className={previewShellClass}>
          <div className={previewMediaWrapClass}>
            <img
              src={selectedAsset.publicUrl}
              alt={selectedAsset.altText || selectedAsset.title || selectedAsset.originalName}
              className={previewImageClass}
            />
          </div>
          <div className={compact ? "p-2.5" : "p-3"}>
            <p
              className={
                compact
                  ? "admin-media-preview-title admin-media-preview-title--compact"
                  : "admin-media-preview-title"
              }
            >
              {selectedAsset.title || selectedAsset.originalName}
            </p>
          </div>
        </div>
      ) : selectedUrl ? (
        <div className={previewShellClass}>
          <div className={previewMediaWrapClass}>
            <img
              src={selectedUrl}
              alt=""
              className={previewImageClass}
            />
          </div>
          <div className={compact ? "p-2.5" : "p-3"}>
            <p className="admin-muted truncate text-xs">
              Manuel URL / ekstern URL
            </p>
          </div>
        </div>
      ) : null}

      {isOpen ? (
        <div
          className="admin-media-picker-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="admin-media-picker-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex max-h-[70vh] w-full flex-col overflow-hidden rounded-3xl">
              <div className="admin-media-picker-popover-header">
                <div>
                  <h2 className="admin-section-title">Vælg billede</h2>
                  <p className="admin-muted mt-1 text-sm">
                    {assets.length} aktive billeder i Media Library.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="admin-btn"
                >
                  Luk
                </button>
              </div>

              <div className="overflow-y-auto p-5">
                {assets.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                    {assets.map((asset) => (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => selectAsset(asset.publicUrl)}
                        className="admin-media-asset-button group"
                      >
                        <div className="admin-media-asset-frame">
                          <img
                            src={asset.publicUrl}
                            alt={asset.altText || asset.title || asset.originalName}
                            className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                          />
                        </div>

                        <div className="p-3">
                          <p className="admin-media-asset-title">
                            {asset.title || asset.originalName}
                          </p>
                          <p className="admin-muted truncate text-xs">
                            {formatFileSize(asset.sizeBytes)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="admin-empty-state">
                    Der er endnu ikke uploadet billeder i Media Library.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
