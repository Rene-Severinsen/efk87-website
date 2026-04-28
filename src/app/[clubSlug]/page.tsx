import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../lib/tenancy/tenantService";

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

  const displayName = club.settings?.displayName || club.name;

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          {displayName}
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          Club platform foundation is active.
        </p>
        <div className="pt-8 border-t border-slate-100">
          <code className="text-sm text-slate-400 font-mono">
            Tenant slug: {clubSlug}
          </code>
        </div>
      </div>
    </main>
  );
}
