"use client";

import { useState } from "react";
import type { PublicClubFooter, PublicSponsor } from "../../../../generated/prisma";
import { updatePublicFooterAction } from "../../../../lib/admin/publicFooterActions";

interface FooterAdminFormProps {
  clubSlug: string;
  footer: PublicClubFooter | null;
  sponsors: PublicSponsor[];
}

interface SponsorRow {
  key: string;
  id: string;
  name: string;
  href: string;
  sortOrder: number;
  isActive: boolean;
}

function buildSponsorRows(sponsors: PublicSponsor[]): SponsorRow[] {
  if (sponsors.length === 0) {
    return [
      {
        key: "new-1",
        id: "",
        name: "",
        href: "",
        sortOrder: 10,
        isActive: true,
      },
    ];
  }

  return sponsors.map((sponsor, index) => ({
    key: sponsor.id,
    id: sponsor.id,
    name: sponsor.name,
    href: sponsor.href ?? "",
    sortOrder: sponsor.sortOrder || (index + 1) * 10,
    isActive: sponsor.isActive,
  }));
}

export default function FooterAdminForm({
  clubSlug,
  footer,
  sponsors,
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
      {
        key: `new-${Date.now()}`,
        id: "",
        name: "",
        href: "",
        sortOrder: (currentRows.length + 1) * 10,
        isActive: true,
      },
    ]);
  }

  function removeSponsorRow(key: string) {
    setRows((currentRows) => {
      const nextRows = currentRows.filter((row) => row.key !== key);

      if (nextRows.length > 0) {
        return nextRows;
      }

      return [
        {
          key: `new-${Date.now()}`,
          id: "",
          name: "",
          href: "",
          sortOrder: 10,
          isActive: true,
        },
      ];
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <section className="admin-card">
        <div className="mb-6">
          <h2 className="admin-section-title">Footer indhold</h2>
          <p className="text-sm text-slate-400">
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
            <p className="text-sm text-slate-400">
              Sponsorer vises i footeren, hvis de er aktive. Logoer tilføjes senere, når modellen er besluttet.
            </p>
          </div>

          <button type="button" onClick={addSponsorRow} className="admin-btn admin-btn-primary">
            Tilføj sponsor
          </button>
        </div>

        <div className="space-y-4">
          {rows.map((row, index) => (
            <div
              key={row.key}
              className="grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 xl:grid-cols-[1fr_1.3fr_120px_110px_90px]"
            >
              <input type="hidden" name="sponsorId" defaultValue={row.id} />

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

              <label>
                <span className="admin-form-label">Sortering</span>
                <input
                  name="sponsorSortOrder"
                  type="number"
                  defaultValue={row.sortOrder}
                  className="admin-input"
                />
              </label>

              <label className="flex min-h-[42px] items-center gap-3 self-end rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-slate-200">
                <input
                  type="checkbox"
                  name={`sponsorActive-${index}`}
                  defaultChecked={row.isActive}
                  className="h-4 w-4 accent-sky-500"
                />
                Aktiv
              </label>

              <button
                type="button"
                onClick={() => removeSponsorRow(row.key)}
                className="admin-btn admin-btn-ghost self-end"
              >
                Fjern
              </button>
            </div>
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
