import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../lib/tenancy/tenantService";
import PublicClubShell from "../../../components/publicSite/PublicClubShell";

interface ForumPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

/**
 * Placeholder for the future member forum.
 * This route is intended to be MEMBERS_ONLY in the future.
 * Authentication and forum backend are not implemented yet.
 */
export default async function ForumPage({ params }: ForumPageProps) {
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
            Forum
          </h1>
          <p className="text-lg text-slate-600">
            Forum bliver et medlemsområde senere. Det er ikke offentligt tilgængeligt endnu.
          </p>
        </div>
      </div>
    </PublicClubShell>
  );
}
