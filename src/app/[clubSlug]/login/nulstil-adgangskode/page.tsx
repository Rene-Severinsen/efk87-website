"use client";

import { use, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { resetPasswordAction } from "../../../../lib/auth/passwordActions";
import { publicRoutes } from "../../../../lib/publicRoutes";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
  searchParams: Promise<{
    token?: string;
  }>;
}

export default function ResetPasswordPage({ params, searchParams: searchParamsPromise }: PageProps) {
  const { clubSlug } = use(params);
  const { token } = use(searchParamsPromise);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!token) {
      setError("Token mangler.");
      return;
    }

    startTransition(async () => {
      const result = await resetPasswordAction(token, password, confirmPassword);
      
      if (result.error) {
        setError(result.error);
      } else {
        // Redirect to login with success message
        router.push(`${publicRoutes.login(clubSlug)}?success=Din adgangskode er opdateret. Log ind med din nye adgangskode.`);
      }
    });
  }

  if (!token) {
    return (
      <div className="min-h-screen public-page-shell flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-[500px]">
          <ThemedSectionCard>
            <h1 className="text-3xl font-bold mb-8 text-center text-[var(--public-danger)]">Fejl</h1>
            <p className="text-center public-soft-text mb-6">Linket til nulstilling af adgangskode er ugyldigt.</p>
            <div className="text-center">
              <button
                onClick={() => router.push(publicRoutes.login(clubSlug))}
                className="public-link"
              >
                Gå til login
              </button>
            </div>
          </ThemedSectionCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen public-page-shell flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[500px]">
        <ThemedSectionCard>
          <h1 className="text-3xl font-bold mb-8 text-center">Nulstil adgangskode</h1>

          {error && (
            <div className="public-alert public-alert-danger">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" title="Ny adgangskode" className="public-label">
                Ny adgangskode
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                minLength={8}
                className="public-input"
              />
              <p className="text-xs public-soft-text mt-2">Mindst 8 tegn.</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" title="Gentag adgangskode" className="public-label">
                Gentag adgangskode
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                required
                className="public-input"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full public-primary-button"
            >
              {isPending ? "Opdaterer..." : "Opdater adgangskode"}
            </button>
          </form>
        </ThemedSectionCard>
      </div>
    </div>
  );
}
