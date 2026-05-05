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
        className="admin-card"
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold">
            Logo og favicon
          </h2>
          <p className="admin-muted">
            Upload logo én gang. Systemet danner selv favicon og Apple icon. Der bruges ingen fallback.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="logoFile" className="admin-form-label">
              Logo
            </label>
            <input
              id="logoFile"
              name="logoFile"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/gif,.jpg,.jpeg,.png,.webp,.heic,.heif,.gif"
              className="admin-file-input"
            />
            <p className="admin-form-help">
              JPG, PNG, WebP, HEIC, HEIF eller GIF. Maks 25 MB.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="logoAltText" className="admin-form-label">
              Logo alt-tekst
            </label>
            <input
              id="logoAltText"
              name="logoAltText"
              defaultValue={branding.logoAltText ?? ""}
              placeholder="Fx EFK87 logo"
              className="admin-input"
            />
          </div>
        </div>

        {status === "success" ? (
          <div className="admin-alert admin-alert-success mt-5">
            Branding er gemt.
          </div>
        ) : null}

        {status === "error" && error ? (
          <div className="admin-alert admin-alert-danger mt-5">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="admin-btn admin-btn-primary"
          >
            {isSaving ? "Gemmer..." : "Gem branding"}
          </button>
        </div>
      </form>

      <section className="admin-card">
        <h2 className="mb-5 text-xl font-bold">
          Aktuel branding
        </h2>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="admin-meta-box">
            <p className="admin-meta-label mb-3">
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
                <code className="admin-code-text mt-3">
                  {branding.logoUrl}
                </code>
              </>
            ) : (
              <p className="admin-muted text-sm">
                Logo er ikke sat.
              </p>
            )}
          </div>

          <div className="admin-meta-box">
            <p className="admin-meta-label mb-3">
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
                <code className="admin-code-text mt-3">
                  {branding.faviconUrl}
                </code>
              </>
            ) : (
              <p className="admin-muted text-sm">
                Favicon er ikke dannet endnu.
              </p>
            )}
          </div>

          <div className="admin-meta-box">
            <p className="admin-meta-label mb-3">
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
                <code className="admin-code-text mt-3">
                  {branding.appleIconUrl}
                </code>
              </>
            ) : (
              <p className="admin-muted text-sm">
                Apple icon er ikke dannet endnu.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
