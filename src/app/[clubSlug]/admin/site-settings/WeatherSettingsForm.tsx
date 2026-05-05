
"use client";

import { useState } from "react";
import { updateWeatherSettingsAction } from "@/lib/admin/siteSettingsActions";

interface WeatherSettingsFormProps {
  clubId: string;
  clubSlug: string;
  initialLatitude: number | null;
  initialLongitude: number | null;
}

export default function WeatherSettingsForm({
  clubId,
  clubSlug,
  initialLatitude,
  initialLongitude
}: WeatherSettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await updateWeatherSettingsAction(clubId, clubSlug, formData);

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
          <h3 className="text-xl font-bold text-[var(--admin-text)] mb-1">Vejr</h3>
          <p className="admin-muted text-sm">Bruges til vejrudsigten i HERO-sektionen på forsiden.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="latitude" className="block text-sm font-medium admin-strong">
              Vejr latitude
            </label>
            <input
              type="number"
              step="any"
              id="latitude"
              name="latitude"
              defaultValue={initialLatitude ?? ""}
              placeholder="f.eks. 55.7656649"
              className="w-full admin-surface-muted border admin-border rounded-xl px-4 py-3 text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="longitude" className="block text-sm font-medium admin-strong">
              Vejr longitude
            </label>
            <input
              type="number"
              step="any"
              id="longitude"
              name="longitude"
              defaultValue={initialLongitude ?? ""}
              placeholder="f.eks. 12.3115583"
              className="w-full admin-surface-muted border admin-border rounded-xl px-4 py-3 text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] transition-all"
            />
          </div>
        </div>

        <p className="text-xs admin-muted italic">
          EFK87: 55.7656649 / 12.3115583
        </p>
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
              <svg className="animate-spin h-5 w-5 text-[var(--admin-text)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
