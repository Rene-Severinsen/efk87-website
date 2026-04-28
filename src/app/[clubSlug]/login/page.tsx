import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../lib/tenancy/tenantService";
import PublicClubShell from "../../../components/publicSite/PublicClubShell";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

/**
 * Login placeholder page.
 * NOTE: Authentication and session handling are intentionally not implemented yet.
 * This is a simple placeholder to show where the login functionality will be.
 */
export default async function LoginPage({ params }: PageProps) {
  const { clubSlug } = await params;

  let club;
  try {
    club = await requireClubBySlug(clubSlug);
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }
    throw error;
  }

  return (
    <PublicClubShell club={club}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Log ind</h1>
        <div className="bg-white p-8 border border-slate-200 rounded-lg max-w-md mx-auto">
          <p className="text-lg text-slate-600 text-center">
            Login bliver tilføjet senere.
          </p>
        </div>
      </div>
    </PublicClubShell>
  );
}
