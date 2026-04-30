"use client";

import { use, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { resetPasswordAction } from "../../../../lib/auth/passwordActions";

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
        router.push(`/${clubSlug}/login?success=Din adgangskode er opdateret. Log ind med din nye adgangskode.`);
      }
    });
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-[500px]">
          <ThemedSectionCard>
            <h1 className="text-3xl font-bold mb-8 text-center text-red-500">Fejl</h1>
            <p className="text-center opacity-80 mb-6">Linket til nulstilling af adgangskode er ugyldigt.</p>
            <div className="text-center">
              <button
                onClick={() => router.push(`/${clubSlug}/login`)}
                className="text-blue-400 hover:text-blue-300 transition-colors"
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
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[500px]">
        <ThemedSectionCard>
          <h1 className="text-3xl font-bold mb-8 text-center">Nulstil adgangskode</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-md text-red-200 text-sm">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" title="Ny adgangskode" className="block text-sm font-medium opacity-80 mb-2">
                Ny adgangskode
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                minLength={8}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-white/30"
              />
              <p className="text-xs opacity-50 mt-2">Mindst 8 tegn.</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" title="Gentag adgangskode" className="block text-sm font-medium opacity-80 mb-2">
                Gentag adgangskode
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-white/30"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              {isPending ? "Opdaterer..." : "Opdater adgangskode"}
            </button>
          </form>
        </ThemedSectionCard>
      </div>
    </div>
  );
}
