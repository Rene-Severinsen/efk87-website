
"use client";

import { useState } from "react";
import { updatePublicThemeAction } from "@/lib/admin/siteSettingsActions";

interface PublicThemeSettingsFormProps {
  clubId: string;
  clubSlug: string;
  initialThemeMode: string;
}

export default function PublicThemeSettingsForm({
  clubId,
  clubSlug,
  initialThemeMode
}: PublicThemeSettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await updatePublicThemeAction(clubId, clubSlug, formData);

    setLoading(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || "Der skete en fejl.");
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Offentligt tema</h3>
          <p className="admin-muted text-sm">Vælg det visuelle tema for klubbens offentlige forside.</p>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 admin-surface-muted border admin-border rounded-xl cursor-pointer hover:border-sky-500/50 transition-all">
            <input
              type="radio"
              name="publicThemeMode"
              value="light"
              defaultChecked={initialThemeMode === "light"}
              className="w-5 h-5 admin-accent-input"
            />
            <div className="flex flex-col">
              <span className="text-white font-medium">Lys</span>
              <span className="admin-muted text-xs">Et lyst, læsevenligt design med blå nuancer.</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 admin-surface-muted border admin-border rounded-xl cursor-pointer hover:border-sky-500/50 transition-all">
            <input
              type="radio"
              name="publicThemeMode"
              value="dark"
              defaultChecked={initialThemeMode === "dark"}
              className="w-5 h-5 admin-accent-input"
            />
            <div className="flex flex-col">
              <span className="text-white font-medium">Mørk</span>
              <span className="admin-muted text-xs">Det klassiske mørke premium design.</span>
            </div>
          </label>
        </div>
      </div>

      {error && (
        <div className="p-4 admin-alert admin-alert-danger text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 admin-alert admin-alert-success text-sm font-medium">
          Indstillingerne er gemt!
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="admin-btn admin-btn-primary"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Gemmer...
            </>
          ) : (
            "Gem ændringer"
          )}
        </button>
      </div>
    </form>
  );
}
