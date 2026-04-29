import { resolveClubContext } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../components/publicSite/ThemedBuildingBlocks";
import { env } from "../../../lib/config/env";
import { signIn } from "../../../auth";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
  searchParams: Promise<{
    reason?: string;
  }>;
}

/**
 * Login page.
 * Uses Auth.js for authentication.
 */
export default async function LoginPage({ params, searchParams }: PageProps) {
  const { clubSlug } = await params;
  const { reason } = await searchParams;

  const { club, theme, footerData, navigationItems, actionItems } = await resolveClubContext(clubSlug);

  const isMemberRequired = reason === "member-required";
  const isEmailConfigured = !!(env.AUTH_EMAIL_SERVER && env.AUTH_EMAIL_FROM);
  const isEmailEnabled = env.AUTH_EMAIL_LOGIN_ENABLED;

  return (
    <ThemedClubPageShell
      clubName={club.settings?.shortName || club.name}
      clubDisplayName={club.settings?.displayName || club.name}
      theme={theme}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title="Log ind"
      currentPath={`/${clubSlug}/login`}
      maxWidth="500px"
    >
      <ThemedSectionCard>
        {isMemberRequired && (
          <div className="mb-6 p-4 bg-amber-900/30 border border-amber-500/50 rounded-md text-amber-200 text-sm">
            Du skal være logget ind som aktivt medlem for at se denne side.
          </div>
        )}

        {!isEmailEnabled ? (
          <p className="text-lg opacity-90 text-center">
            Login er ikke aktiveret endnu.
          </p>
        ) : !isEmailConfigured ? (
          <p className="text-lg opacity-90 text-center">
            Login kræver mailopsætning, som ikke er konfigureret endnu.
          </p>
        ) : (
          <form
            action={async (formData) => {
              "use server";
              if (!env.AUTH_EMAIL_LOGIN_ENABLED || !env.AUTH_EMAIL_SERVER || !env.AUTH_EMAIL_FROM) {
                // Fallback for security - though UI should hide it
                return;
              }
              const email = formData.get("email") as string;
              await signIn("email", { email, redirectTo: `/${clubSlug}` });
            }}
            className="space-y-6"
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium opacity-80 mb-2">
                Email adresse
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
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Send magic link
            </button>
          </form>
        )}

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <p className="text-sm opacity-60">
            Login giver kun adgang, hvis din bruger har aktivt medlemskab af klubben.
          </p>
        </div>
      </ThemedSectionCard>
    </ThemedClubPageShell>
  );
}
