"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemedSectionCard } from "../../../components/publicSite/ThemedBuildingBlocks";

export default function LoginForm({ 
  clubSlug, 
  callbackUrl, 
  reason, 
  authError, 
  authSuccess 
}: { 
  clubSlug: string; 
  callbackUrl: string; 
  reason?: string;
  authError?: string;
  authSuccess?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [mode, setMode] = useState<"password" | "magic-link">("password");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(authError === "CredentialsSignin" ? "E-mail eller adgangskode er forkert." : null);
  const [success, setSuccess] = useState<string | null>(authSuccess || null);

  const isMemberRequired = reason === "member-required";

  async function handlePasswordLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.info("[AUTH FORM] password submit");
    setError(null);
    setSuccess(null);
    
    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get("email") as string;
    const password = formData.get("password") as string;

    startTransition(async () => {
      const result = await signIn("credentials", {
        email: emailValue,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("E-mail eller adgangskode er forkert.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    });
  }

  async function handleMagicLinkLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.info("[AUTH FORM] magic-link submit");
    setError(null);
    setSuccess(null);
    
    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get("email") as string;

    startTransition(async () => {
      const result = await signIn("email", {
        email: emailValue,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Der skete en fejl ved afsendelse af login-link.");
      } else {
        setSuccess("Hvis e-mailadressen findes, sender vi et loginlink.");
      }
    });
  }

  return (
    <ThemedSectionCard>
      {isMemberRequired && (
        <div className="mb-6 p-4 bg-amber-900/30 border border-amber-500/50 rounded-md text-amber-200 text-sm">
          Du skal være logget ind som aktivt medlem for at se denne side.
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-md text-red-200 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-900/30 border border-green-500/50 rounded-md text-green-200 text-sm">
          {success}
        </div>
      )}

      {mode === "password" ? (
        <form onSubmit={handlePasswordLogin} className="space-y-6">
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-white/30"
            />
          </div>
          <div>
            <label htmlFor="password" title="Adgangskode" className="block text-sm font-medium opacity-80 mb-2">
              Adgangskode
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-white/30"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
          >
            {isPending ? "Logger ind..." : "Log ind"}
          </button>

          <div className="flex flex-col space-y-4 pt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccess(null);
                setMode("magic-link");
              }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Send loginlink i stedet
            </button>
            <Link
              href={`/${clubSlug}/login/glemt-adgangskode`}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Glemt adgangskode?
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleMagicLinkLogin} className="space-y-6">
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-white/30"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
          >
            {isPending ? "Sender..." : "Send magic link"}
          </button>

          <div className="flex flex-col pt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccess(null);
                setMode("password");
              }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Log ind med adgangskode i stedet
            </button>
          </div>
        </form>
      )}

      <div className="mt-10 pt-8 border-t border-white/5 text-center">
        <p className="text-sm opacity-60">
          Login giver kun adgang, hvis din bruger har aktivt medlemskab af klubben.
        </p>
      </div>
    </ThemedSectionCard>
  );
}
