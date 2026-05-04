"use client";

import { use, useState, useTransition } from "react";
import Link from "next/link";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { forgotPasswordAction } from "../../../../lib/auth/passwordActions";
import { publicRoutes } from "../../../../lib/publicRoutes";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default function ForgotPasswordPage({ params }: PageProps) {
  const { clubSlug } = use(params);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.info("[AUTH FORM] forgot-password submit");
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    
    startTransition(async () => {
      const result = await forgotPasswordAction(clubSlug, email);
      setMessage(result.message);
    });
  }

  return (
    <div className="min-h-screen public-page-shell flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[500px]">
        <ThemedSectionCard>
          <h1 className="text-3xl font-bold mb-8 text-center text-[var(--public-text)]">Glemt adgangskode</h1>

          {message ? (
            <div className="space-y-6">
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-700 dark:text-blue-300 text-sm">
                {message}
              </div>
              <div className="text-center">
                <Link
                  href={publicRoutes.login(clubSlug)}
                  className="text-[var(--public-primary)] hover:opacity-80 transition-opacity font-medium"
                >
                  Tilbage til login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="public-muted-text">
                Indtast din e-mailadresse nedenfor, så sender vi dig et link til at vælge en ny adgangskode.
              </p>
              
              <div>
                <label htmlFor="email" className="public-label">
                  E-mail adresse
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  placeholder="din@email.dk"
                  className="public-input"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="public-primary-button w-full"
              >
                {isPending ? "Sender..." : "Send nulstillingslink"}
              </button>

              <div className="text-center pt-2">
                <Link
                  href={publicRoutes.login(clubSlug)}
                  className="text-sm text-[var(--public-primary)] hover:opacity-80 transition-opacity"
                >
                  Tilbage til login
                </Link>
              </div>
            </form>
          )}
        </ThemedSectionCard>
      </div>
    </div>
  );
}
