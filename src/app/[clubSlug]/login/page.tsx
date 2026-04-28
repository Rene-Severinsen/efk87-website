import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../lib/tenancy/tenantService";
import PublicClubShell from "../../../components/publicSite/PublicClubShell";
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

  let club;
  try {
    club = await requireClubBySlug(clubSlug);
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }
    throw error;
  }

  const isMemberRequired = reason === "member-required";
  const isEmailConfigured = !!(env.AUTH_EMAIL_SERVER && env.AUTH_EMAIL_FROM);
  const isEmailEnabled = env.AUTH_EMAIL_LOGIN_ENABLED;

  return (
    <PublicClubShell club={club}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-6 text-center">Log ind</h1>
        <div className="bg-white p-8 border border-slate-200 rounded-lg max-w-md mx-auto shadow-sm">
          {isMemberRequired && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
              Du skal være logget ind som aktivt medlem for at se denne side.
            </div>
          )}

          {!isEmailEnabled ? (
            <p className="text-lg text-slate-600 text-center">
              Login er ikke aktiveret endnu.
            </p>
          ) : !isEmailConfigured ? (
            <p className="text-lg text-slate-600 text-center">
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
                await signIn("nodemailer", { email, redirectTo: `/${clubSlug}` });
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email adresse
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  placeholder="din@email.dk"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Send magic link
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Login giver kun adgang, hvis din bruger har aktivt medlemskab af klubben.
            </p>
          </div>
        </div>
      </div>
    </PublicClubShell>
  );
}
