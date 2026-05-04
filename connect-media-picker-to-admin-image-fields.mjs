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
    "src/components/admin/media/MediaUrlPicker.tsx",
    `
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
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-slate-300">
        {label}
      </label>

      <input
        id={name}
        name={name}
        value={selectedUrl}
        onChange={(event) => setSelectedUrl(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white placeholder:text-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/50"
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15"
        >
          Vælg fra Media
        </button>

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
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
                          {asset.originalName}
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
`,
);

patchFile("src/app/[clubSlug]/admin/her-bor-vi/page.tsx", (current) => {
    let next = current;

    if (!next.includes("listClubMediaAssets")) {
        next = next.replace(
            `import { getClubLocationPageContent } from "../../../../lib/locationPage/locationPageService";`,
            `import { getClubLocationPageContent } from "../../../../lib/locationPage/locationPageService";
import { listClubMediaAssets } from "../../../../lib/media/mediaStorageService";`,
        );
    }

    next = next.replace(
        `const content = await getClubLocationPageContent(club.id);`,
        `const [content, mediaAssets] = await Promise.all([
        getClubLocationPageContent(club.id),
        listClubMediaAssets(club.id),
    ]);`,
    );

    next = next.replace(
        `<LocationPageAdminForm
                    clubSlug={clubSlug}
                    initialContent={content}
                />`,
        `<LocationPageAdminForm
                    clubSlug={clubSlug}
                    initialContent={content}
                    mediaAssets={mediaAssets}
                />`,
    );

    return next;
});

patchFile("src/app/[clubSlug]/admin/her-bor-vi/LocationPageAdminForm.tsx", (current) => {
    let next = current;

    if (!next.includes("MediaUrlPicker")) {
        next = next.replace(
            `import { ClubLocationPageContent } from "../../../../lib/locationPage/locationPageDefaults";`,
            `import { ClubLocationPageContent } from "../../../../lib/locationPage/locationPageDefaults";
import { ClubMediaAssetDTO } from "../../../../lib/media/mediaTypes";
import MediaUrlPicker from "../../../../components/admin/media/MediaUrlPicker";`,
        );
    }

    next = next.replace(
        `initialContent: ClubLocationPageContent;`,
        `initialContent: ClubLocationPageContent;
    mediaAssets: ClubMediaAssetDTO[];`,
    );

    next = next.replace(
        `altValue,
                       }: {
    title: string;`,
        `altValue,
                           mediaAssets,
                       }: {
    title: string;`,
    );

    next = next.replace(
        `altValue: string;
}) {`,
        `altValue: string;
    mediaAssets: ClubMediaAssetDTO[];
}) {`,
    );

    next = next.replace(
        `<TextInput
                    name={urlName}
                    label="Billed-URL"
                    value={urlValue}
                    placeholder="https://..."
                />`,
        `<MediaUrlPicker
                    name={urlName}
                    label="Billede"
                    value={urlValue}
                    assets={mediaAssets}
                />`,
    );

    next = next.replace(
        `clubSlug,
                                                  initialContent,
                                              }: LocationPageAdminFormProps)`,
        `clubSlug,
                                                  initialContent,
                                                  mediaAssets,
                                              }: LocationPageAdminFormProps)`,
    );

    next = next.replaceAll(
        `altValue={initialContent.accessImageAlt}
                    />`,
        `altValue={initialContent.accessImageAlt}
                        mediaAssets={mediaAssets}
                    />`,
    );

    next = next.replaceAll(
        `altValue={initialContent.drivingImageAlt}
                    />`,
        `altValue={initialContent.drivingImageAlt}
                        mediaAssets={mediaAssets}
                    />`,
    );

    next = next.replaceAll(
        `altValue={initialContent.parkingImageAlt}
                    />`,
        `altValue={initialContent.parkingImageAlt}
                        mediaAssets={mediaAssets}
                    />`,
    );

    next = next.replaceAll(
        `altValue={initialContent.indoorImageAlt}
                    />`,
        `altValue={initialContent.indoorImageAlt}
                        mediaAssets={mediaAssets}
                    />`,
    );

    next = next.replace(
        `V1 bruger billed-URL’er. Upload/media-bibliotek kobles på senere.`,
        `Vælg billeder fra Media Library eller indsæt en ekstern URL manuelt.`,
    );

    return next;
});

patchFile("src/app/[clubSlug]/admin/regler-og-bestemmelser/page.tsx", (current) => {
    let next = current;

    if (!next.includes("listClubMediaAssets")) {
        next = next.replace(
            `import { getClubRulesPageContent } from "../../../../lib/rulesPage/rulesPageService";`,
            `import { getClubRulesPageContent } from "../../../../lib/rulesPage/rulesPageService";
import { listClubMediaAssets } from "../../../../lib/media/mediaStorageService";`,
        );
    }

    next = next.replace(
        `const content = await getClubRulesPageContent(club.id);`,
        `const [content, mediaAssets] = await Promise.all([
    getClubRulesPageContent(club.id),
    listClubMediaAssets(club.id),
  ]);`,
    );

    next = next.replace(
        `<RulesPageAdminForm
          clubSlug={clubSlug}
          initialContent={content}
        />`,
        `<RulesPageAdminForm
          clubSlug={clubSlug}
          initialContent={content}
          mediaAssets={mediaAssets}
        />`,
    );

    return next;
});

patchFile("src/app/[clubSlug]/admin/regler-og-bestemmelser/RulesPageAdminForm.tsx", (current) => {
    let next = current;

    if (!next.includes("MediaUrlPicker")) {
        next = next.replace(
            `import { ClubRulesPageContent } from "../../../../lib/rulesPage/rulesPageDefaults";`,
            `import { ClubRulesPageContent } from "../../../../lib/rulesPage/rulesPageDefaults";
import { ClubMediaAssetDTO } from "../../../../lib/media/mediaTypes";
import MediaUrlPicker from "../../../../components/admin/media/MediaUrlPicker";`,
        );
    }

    next = next.replace(
        `initialContent: ClubRulesPageContent;`,
        `initialContent: ClubRulesPageContent;
  mediaAssets: ClubMediaAssetDTO[];`,
    );

    next = next.replace(
        `initialContent,
}: RulesPageAdminFormProps)`,
        `initialContent,
  mediaAssets,
}: RulesPageAdminFormProps)`,
    );

    next = next.replace(
        `<TextInput
                name="flightZoneImageUrl"
                label="Link til billede over flyvezone"
                value={initialContent.flightZoneImageUrl}
                placeholder="https://..."
              />`,
        `<MediaUrlPicker
                name="flightZoneImageUrl"
                label="Billede over flyvezone"
                value={initialContent.flightZoneImageUrl}
                assets={mediaAssets}
              />`,
    );

    return next;
});

patchFile("src/app/[clubSlug]/admin/artikler/ny/page.tsx", (current) => {
    let next = current;

    if (!next.includes("listClubMediaAssets")) {
        next = next.replace(
            `import { getAdminArticleFormOptions } from "../../../../../lib/admin/articleAdminService";`,
            `import { getAdminArticleFormOptions } from "../../../../../lib/admin/articleAdminService";
import { listClubMediaAssets } from "../../../../../lib/media/mediaStorageService";`,
        );
    }

    next = next.replace(
        `const { tags } = await getAdminArticleFormOptions(club.id);`,
        `const [{ tags }, mediaAssets] = await Promise.all([
    getAdminArticleFormOptions(club.id),
    listClubMediaAssets(club.id),
  ]);`,
    );

    next = next.replace(
        `<ArticleForm 
        clubSlug={clubSlug}
        tags={tags}
        action={boundAction}
      />`,
        `<ArticleForm
        clubSlug={clubSlug}
        tags={tags}
        action={boundAction}
        mediaAssets={mediaAssets}
      />`,
    );

    return next;
});

patchFile("src/app/[clubSlug]/admin/artikler/[articleId]/rediger/page.tsx", (current) => {
    let next = current;

    if (!next.includes("listClubMediaAssets")) {
        next = next.replace(
            `import { getAdminArticleById, getAdminArticleFormOptions } from "../../../../../../lib/admin/articleAdminService";`,
            `import { getAdminArticleById, getAdminArticleFormOptions } from "../../../../../../lib/admin/articleAdminService";
import { listClubMediaAssets } from "../../../../../../lib/media/mediaStorageService";`,
        );
    }

    next = next.replace(
        `const [article, { tags }] = await Promise.all([
    getAdminArticleById(club.id, articleId),
    getAdminArticleFormOptions(club.id),
  ]);`,
        `const [article, { tags }, mediaAssets] = await Promise.all([
    getAdminArticleById(club.id, articleId),
    getAdminArticleFormOptions(club.id),
    listClubMediaAssets(club.id),
  ]);`,
    );

    next = next.replace(
        `<ArticleForm 
        clubSlug={clubSlug}
        initialData={article}
        tags={tags}
        action={boundAction}
      />`,
        `<ArticleForm
        clubSlug={clubSlug}
        initialData={article}
        tags={tags}
        action={boundAction}
        mediaAssets={mediaAssets}
      />`,
    );

    return next;
});

patchFile("src/components/admin/articles/ArticleForm.tsx", (current) => {
    let next = current;

    if (!next.includes("MediaUrlPicker")) {
        next = next.replace(
            `import Link from "next/link";`,
            `import Link from "next/link";
import { ClubMediaAssetDTO } from "../../../lib/media/mediaTypes";
import MediaUrlPicker from "../media/MediaUrlPicker";`,
        );
    }

    next = next.replace(
        `action: (formData: FormData) => Promise<void>;`,
        `action: (formData: FormData) => Promise<void>;
  mediaAssets?: ClubMediaAssetDTO[];`,
    );

    next = next.replace(
        `action,
}: ArticleFormProps)`,
        `action,
  mediaAssets = [],
}: ArticleFormProps)`,
    );

    next = next.replace(
        `<div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>Hero Image URL (Valgfri)</label>
            <input
              name="heroImageUrl"
              type="text"
              defaultValue={initialData?.heroImageUrl ?? undefined}
              placeholder="https://eksempel.dk/billede.jpg"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
            />
            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>Dette billede vises øverst i artiklen.</p>
          </div>`,
        `<div style={{ marginBottom: '16px' }}>
            <MediaUrlPicker
              name="heroImageUrl"
              label="Hero image"
              value={initialData?.heroImageUrl ?? null}
              assets={mediaAssets}
              placeholder="Vælg fra Media eller indsæt URL"
            />
            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '8px' }}>
              Dette billede vises øverst i artiklen.
            </p>
          </div>`,
    );

    return next;
});

console.log("");
console.log("Done.");
console.log("Next:");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");