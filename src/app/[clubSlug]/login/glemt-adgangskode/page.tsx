"use client";

import { use, useState, useTransition } from "react";
import Link from "next/link";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { forgotPasswordAction } from "../../../../lib/auth/passwordActions";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default function ForgotPasswordPage({ params }: PageProps) {
  const { clubSlug } = use(params);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const email = formData.get("email") as string;
    
    startTransition(async () => {
      const result = await forgotPasswordAction(clubSlug, email);
      setMessage(result.message);
    });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[500px]">
        <ThemedSectionCard>
          <h1 className="text-3xl font-bold mb-8 text-center">Glemt adgangskode</h1>

          {message ? (
            <div className="space-y-6">
              <div className="p-4 bg-blue-900/30 border border-blue-500/50 rounded-md text-blue-200 text-sm">
                {message}
              </div>
              <div className="text-center">
                <Link
                  href={`/${clubSlug}/login`}
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Tilbage til login
                </Link>
              </div>
            </div>
          ) : (
            <form action={handleSubmit} className="space-y-6">
              <p className="text-sm opacity-80 leading-relaxed">
                Indtast din e-mailadresse nedenfor, så sender vi dig et link til at vælge en ny adgangskode.
              </p>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium opacity-80 mb-2">
                  E-mail adresse
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  placeholder="din@email.dk"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-white/30"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              >
                {isPending ? "Sender..." : "Send nulstillingslink"}
              </button>

              <div className="text-center pt-2">
                <Link
                  href={`/${clubSlug}/login`}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
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
