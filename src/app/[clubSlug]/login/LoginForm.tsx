"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { ThemedSectionCard } from "../../../components/publicSite/ThemedBuildingBlocks";
import { publicRoutes } from "../../../lib/publicRoutes";

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
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-700 dark:text-amber-300 text-sm">
          Du skal være logget ind som aktivt medlem for at se denne side.
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-700 dark:text-green-300 text-sm">
          {success}
        </div>
      )}

      {mode === "password" ? (
        <form onSubmit={handlePasswordLogin} className="space-y-6">
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="public-input"
            />
          </div>
          <div>
            <label htmlFor="password" title="Adgangskode" className="public-label">
              Adgangskode
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              className="public-input"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="public-primary-button w-full"
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
              className="text-sm text-[var(--public-primary)] hover:opacity-80 transition-opacity"
            >
              Send loginlink i stedet
            </button>
            <Link
              href={publicRoutes.forgotPassword(clubSlug)}
              className="text-sm text-[var(--public-primary)] hover:opacity-80 transition-opacity"
            >
              Glemt adgangskode?
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleMagicLinkLogin} className="space-y-6">
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="public-input"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="public-primary-button w-full"
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
              className="text-sm text-[var(--public-primary)] hover:opacity-80 transition-opacity"
            >
              Log ind med adgangskode i stedet
            </button>
          </div>
        </form>
      )}

      <div className="mt-10 pt-8 border-t border-[var(--public-card-border)] text-center">
        <p className="public-muted-text">
          Login giver kun adgang, hvis din bruger har aktivt medlemskab af klubben.
        </p>
      </div>
    </ThemedSectionCard>
  );
}
