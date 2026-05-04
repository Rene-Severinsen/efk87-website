"use client";

import { useMemo, useState } from "react";
import { ClubMediaAssetDTO } from "../../../lib/media/mediaTypes";

interface MediaUrlPickerProps {
  name: string;
  label: string;
  value: string | null;
  assets: ClubMediaAssetDTO[];
  placeholder?: string;
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

  return (
    <div className="space-y-3">
      <label htmlFor={name} className="block text-sm font-medium text-slate-300">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full rounded-xl border border-sky-500/40 bg-sky-600 px-4 py-3 text-left text-sm font-bold text-white shadow-lg shadow-sky-900/20 transition hover:bg-sky-500"
      >
        Vælg billede fra Media
      </button>

      <input
        id={name}
        name={name}
        value={selectedUrl}
        onClick={() => setIsOpen(true)}
        onChange={(event) => setSelectedUrl(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white placeholder:text-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/50"
      />

      <div className="flex flex-wrap gap-2">
        {selectedUrl ? (
          <>
            <a
              href={selectedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15"
            >
              Åbn
            </a>

            <button
              type="button"
              onClick={clearSelection}
              className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-bold text-rose-300 transition hover:bg-rose-500/20"
            >
              Ryd
            </button>
          </>
        ) : null}
      </div>

      {selectedAsset ? (
        <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="aspect-[16/9] bg-[#0f172a]">
            <img
              src={selectedAsset.publicUrl}
              alt={selectedAsset.altText || selectedAsset.title || selectedAsset.originalName}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-3">
            <p className="truncate text-sm font-bold text-white">
              {selectedAsset.title || selectedAsset.originalName}
            </p>
            <p className="truncate text-xs text-slate-400">
              {selectedAsset.publicUrl}
            </p>
          </div>
        </div>
      ) : selectedUrl ? (
        <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="aspect-[16/9] bg-[#0f172a]">
            <img
              src={selectedUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-3">
            <p className="truncate text-xs text-slate-400">
              Manuel URL / ekstern URL
            </p>
          </div>
        </div>
      ) : null}

      {isOpen ? (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-6xl flex-col rounded-3xl border border-white/10 bg-[#0b1120] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Vælg billede
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {assets.length} aktive billeder i Media Library.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15"
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
                      className="group overflow-hidden rounded-2xl border border-white/10 bg-[#121b2e]/80 text-left shadow-lg transition hover:border-sky-500/50 hover:bg-[#17233a]"
                    >
                      <div className="aspect-square bg-[#0f172a]">
                        <img
                          src={asset.publicUrl}
                          alt={asset.altText || asset.title || asset.originalName}
                          className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                        />
                      </div>

                      <div className="p-3">
                        <p className="truncate text-sm font-bold text-white">
                          {asset.title || asset.originalName}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {formatFileSize(asset.sizeBytes)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-slate-400">
                  Der er endnu ikke uploadet billeder i Media Library.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
