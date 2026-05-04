"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ClubBrandingDTO } from "../../../../../lib/branding/clubBrandingService";

interface BrandingSettingsClientProps {
  clubSlug: string;
  initialBranding: ClubBrandingDTO;
}

interface UploadResult {
  success: boolean;
  error?: string;
}

export default function BrandingSettingsClient({
  clubSlug,
  initialBranding,
}: BrandingSettingsClientProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [branding, setBranding] = useState(initialBranding);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSaving(true);
    setStatus("idle");
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch(`/${clubSlug}/admin/settings/branding/upload`, {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as UploadResult & {
        branding?: ClubBrandingDTO;
      };

      if (!response.ok || !result.success) {
        setStatus("error");
        setError(result.error || "Branding kunne ikke gemmes.");
        return;
      }

      if (result.branding) {
        setBranding(result.branding);
      }

      formRef.current?.reset();
      setStatus("success");
      router.refresh();
      setTimeout(() => setStatus("idle"), 3000);
    } catch (uploadError) {
      setStatus("error");
      setError(uploadError instanceof Error ? uploadError.message : "Branding kunne ikke gemmes.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="rounded-3xl border border-white/10 bg-[#121b2e]/80 p-6 shadow-2xl backdrop-blur-md"
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">
            Logo og favicon
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Upload logo én gang. Systemet danner selv favicon og Apple icon. Der bruges ingen fallback.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="logoFile" className="block text-sm font-medium text-slate-300">
              Logo
            </label>
            <input
              id="logoFile"
              name="logoFile"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/gif,.jpg,.jpeg,.png,.webp,.heic,.heif,.gif"
              className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-600 file:px-3 file:py-2 file:text-sm file:font-bold file:text-white"
            />
            <p className="text-xs text-slate-500">
              JPG, PNG, WebP, HEIC, HEIF eller GIF. Maks 25 MB.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="logoAltText" className="block text-sm font-medium text-slate-300">
              Logo alt-tekst
            </label>
            <input
              id="logoAltText"
              name="logoAltText"
              defaultValue={branding.logoAltText ?? ""}
              placeholder="Fx EFK87 logo"
              className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            />
          </div>
        </div>

        {status === "success" ? (
          <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-400">
            Branding er gemt.
          </div>
        ) : null}

        {status === "error" && error ? (
          <div className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-medium text-rose-400">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-sky-600 px-8 py-3 font-bold text-white shadow-lg shadow-sky-900/20 transition-all hover:bg-sky-500 disabled:bg-slate-700 disabled:shadow-none"
          >
            {isSaving ? "Gemmer..." : "Gem branding"}
          </button>
        </div>
      </form>

      <section className="rounded-3xl border border-white/10 bg-[#121b2e]/80 p-6 shadow-2xl backdrop-blur-md">
        <h2 className="mb-5 text-xl font-bold text-white">
          Aktuel branding
        </h2>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-5">
            <p className="mb-3 text-sm font-bold text-slate-300">
              Logo
            </p>

            {branding.logoUrl ? (
              <>
                <div className="flex min-h-28 items-center justify-center rounded-xl bg-white p-4">
                  <img
                    src={branding.logoUrl}
                    alt={branding.logoAltText || "Klublogo"}
                    className="max-h-24 max-w-full object-contain"
                  />
                </div>
                <code className="mt-3 block break-all text-xs text-slate-400">
                  {branding.logoUrl}
                </code>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                Logo er ikke sat.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-5">
            <p className="mb-3 text-sm font-bold text-slate-300">
              Favicon
            </p>

            {branding.faviconUrl ? (
              <>
                <div className="flex min-h-28 items-center justify-center rounded-xl bg-white p-4">
                  <img
                    src={branding.faviconUrl}
                    alt=""
                    className="h-12 w-12 object-contain"
                  />
                </div>
                <code className="mt-3 block break-all text-xs text-slate-400">
                  {branding.faviconUrl}
                </code>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                Favicon er ikke dannet endnu.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-5">
            <p className="mb-3 text-sm font-bold text-slate-300">
              Apple icon
            </p>

            {branding.appleIconUrl ? (
              <>
                <div className="flex min-h-28 items-center justify-center rounded-xl bg-white p-4">
                  <img
                    src={branding.appleIconUrl}
                    alt=""
                    className="h-20 w-20 object-contain"
                  />
                </div>
                <code className="mt-3 block break-all text-xs text-slate-400">
                  {branding.appleIconUrl}
                </code>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                Apple icon er ikke dannet endnu.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
