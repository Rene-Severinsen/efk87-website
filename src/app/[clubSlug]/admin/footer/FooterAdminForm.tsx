"use client";

import { useState } from "react";
import type { PublicClubFooter, PublicSponsor } from "../../../../generated/prisma";
import MediaUrlPicker from "../../../../components/admin/media/MediaUrlPicker";
import { ClubMediaAssetDTO } from "../../../../lib/media/mediaTypes";
import { updatePublicFooterAction } from "../../../../lib/admin/publicFooterActions";

interface FooterAdminFormProps {
  clubSlug: string;
  footer: PublicClubFooter | null;
  sponsors: PublicSponsor[];
  mediaAssets: ClubMediaAssetDTO[];
}

interface SponsorRow {
  key: string;
  id: string;
  name: string;
  href: string;
  logoUrl: string;
  logoAltText: string;
  sortOrder: number;
  isActive: boolean;
}

function createEmptySponsorRow(index: number): SponsorRow {
  return {
    key: `new-${Date.now()}-${index}`,
    id: "",
    name: "",
    href: "",
    logoUrl: "",
    logoAltText: "",
    sortOrder: (index + 1) * 10,
    isActive: true,
  };
}

function buildSponsorRows(sponsors: PublicSponsor[]): SponsorRow[] {
  if (sponsors.length === 0) {
    return [createEmptySponsorRow(0)];
  }

  return sponsors.map((sponsor, index) => ({
    key: sponsor.id,
    id: sponsor.id,
    name: sponsor.name,
    href: sponsor.href ?? "",
    logoUrl: sponsor.logoUrl ?? "",
    logoAltText: sponsor.logoAltText ?? "",
    sortOrder: sponsor.sortOrder || (index + 1) * 10,
    isActive: sponsor.isActive,
  }));
}

export default function FooterAdminForm({
  clubSlug,
  footer,
  sponsors,
  mediaAssets,
}: FooterAdminFormProps) {
  const [rows, setRows] = useState<SponsorRow[]>(() => buildSponsorRows(sponsors));
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    setStatus("idle");
    setError(null);

    const result = await updatePublicFooterAction(clubSlug, formData);

    setIsSaving(false);

    if (result.success) {
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
      return;
    }

    setStatus("error");
    setError(result.error ?? "Footer kunne ikke gemmes.");
  }

  function addSponsorRow() {
    setRows((currentRows) => [
      ...currentRows,
      createEmptySponsorRow(currentRows.length),
    ]);
  }

  function removeSponsorRow(key: string) {
    setRows((currentRows) => {
      const nextRows = currentRows.filter((row) => row.key !== key);

      return nextRows.length > 0 ? nextRows : [createEmptySponsorRow(0)];
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <section className="admin-card">
        <div className="mb-6">
          <h2 className="admin-section-title">Footer indhold</h2>
          <p className="text-sm admin-muted">
            Redigér klubtekst og kontaktoplysninger i footeren.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <label className="lg:col-span-2">
            <span className="admin-form-label">Kort klubtekst</span>
            <textarea
              name="description"
              defaultValue={footer?.description ?? ""}
              rows={5}
              className="admin-textarea"
              placeholder="Kort tekst om klubben..."
            />
          </label>

          <label>
            <span className="admin-form-label">Adresse linje 1</span>
            <input
              name="addressLine1"
              defaultValue={footer?.addressLine1 ?? ""}
              className="admin-input"
            />
          </label>

          <label>
            <span className="admin-form-label">Adresse linje 2</span>
            <input
              name="addressLine2"
              defaultValue={footer?.addressLine2 ?? ""}
              className="admin-input"
            />
          </label>

          <label>
            <span className="admin-form-label">E-mail</span>
            <input
              name="email"
              defaultValue={footer?.email ?? ""}
              className="admin-input"
            />
          </label>

          <label>
            <span className="admin-form-label">Telefon</span>
            <input
              name="phone"
              defaultValue={footer?.phone ?? ""}
              className="admin-input"
            />
          </label>

          <label>
            <span className="admin-form-label">CVR</span>
            <input
              name="cvr"
              defaultValue={footer?.cvr ?? ""}
              className="admin-input"
            />
          </label>
        </div>
      </section>

      <section className="admin-card">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="admin-section-title">Sponsorer & samarbejdspartnere</h2>
            <p className="text-sm admin-muted">
              Vælg sponsorlogo fra Media. Logoet vises automatisk i footeren, hvis sponsoren er aktiv.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a href={`/${clubSlug}/admin/media`} className="admin-btn admin-btn-ghost">
              Åbn media
            </a>
            <button type="button" onClick={addSponsorRow} className="admin-btn admin-btn-primary">
              Tilføj sponsor
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-4">
          {rows.map((row, index) => (
            <article
              key={row.key}
              className="flex min-h-full flex-col rounded-2xl border admin-border bg-white/[0.03] p-4 shadow-lg shadow-black/10"
            >
              <input type="hidden" name="sponsorId" defaultValue={row.id} />

              <div className="mb-4 border-b admin-border pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-white">
                      {row.name || `Sponsor ${index + 1}`}
                    </h3>
                    <p className="mt-1 text-xs admin-muted">
                      Logo, link og synlighed i footeren.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeSponsorRow(row.key)}
                    className="text-xs font-bold admin-muted transition hover:opacity-80"
                  >
                    Fjern
                  </button>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-4">
                <MediaUrlPicker
                  name="sponsorLogoUrl"
                  label="Sponsorlogo"
                  value={row.logoUrl}
                  assets={mediaAssets}
                  placeholder="Vælg billede fra Media"
                  hideUrlInput
                  previewFit="contain"
                  compact
                />

                <label>
                  <span className="admin-form-label">Navn</span>
                  <input
                    name="sponsorName"
                    defaultValue={row.name}
                    className="admin-input"
                    placeholder="Sponsorens navn"
                  />
                </label>

                <label>
                  <span className="admin-form-label">Link</span>
                  <input
                    name="sponsorHref"
                    defaultValue={row.href}
                    className="admin-input"
                    placeholder="https://..."
                  />
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[110px_1fr]">
                  <label>
                    <span className="admin-form-label">Sortering</span>
                    <input
                      name="sponsorSortOrder"
                      type="number"
                      defaultValue={row.sortOrder}
                      className="admin-input"
                    />
                  </label>

                  <label className="flex min-h-[46px] items-center gap-3 self-end rounded-xl border admin-border admin-surface-muted px-4 text-sm font-semibold admin-strong">
                    <input
                      type="checkbox"
                      name={`sponsorActive-${index}`}
                      defaultChecked={row.isActive}
                      className="h-4 w-4 admin-accent-input"
                    />
                    Aktiv i footer
                  </label>
                </div>

                <label>
                  <span className="admin-form-label">Logo alt-tekst</span>
                  <input
                    name="sponsorLogoAltText"
                    defaultValue={row.logoAltText}
                    className="admin-input"
                    placeholder="Valgfri — bruges til tilgængelighed"
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      </section>

      {status === "success" ? (
        <div className="admin-badge admin-badge-success">
          Footer er gemt.
        </div>
      ) : null}

      {status === "error" ? (
        <div className="admin-badge admin-badge-error">
          {error}
        </div>
      ) : null}

      <div className="flex justify-end">
        <button type="submit" disabled={isSaving} className="admin-btn admin-btn-primary">
          {isSaving ? "Gemmer..." : "Gem footer"}
        </button>
      </div>
    </form>
  );
}
