import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../lib/tenancy/tenantService";
import PublicClubShell from "../../components/publicSite/PublicClubShell";

interface ClubPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function ClubPage({ params }: ClubPageProps) {
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
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Club platform foundation is active.
          </h1>
          <div className="pt-8 border-t border-slate-100">
            <code className="text-sm text-slate-400 font-mono">
              Tenant slug: {clubSlug}
            </code>
          </div>
        </div>
      </div>
    </PublicClubShell>
  );
}
