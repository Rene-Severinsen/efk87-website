import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../lib/tenancy/tenantService";
import PublicClubShell from "../../../components/publicSite/PublicClubShell";

interface JegFlyverPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

/**
 * Placeholder for the future "Jeg flyver" submission page.
 * This route is intended to be MEMBERS_ONLY in the future.
 * The submission flow and backend are not implemented yet.
 */
export default async function JegFlyverPage({ params }: JegFlyverPageProps) {
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
      <div className="flex flex-col items-center justify-center p-6 text-slate-900 mt-12">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-sm border border-slate-200 p-12">
          <h1 className="text-4xl font-bold tracking-tight mb-6">
            Jeg flyver
          </h1>
          <p className="text-lg text-slate-600 mb-4">
            Her kan medlemmer senere melde, at de tager ud på pladsen i dag eller en fremtidig dag.
          </p>
          <div className="bg-slate-50 border-l-4 border-slate-300 p-4 rounded text-sm text-slate-500">
            Dagens offentlige aktivitetsliste vises på forsiden, men oprettelse kræver senere login.
          </div>
        </div>
      </div>
    </PublicClubShell>
  );
}
