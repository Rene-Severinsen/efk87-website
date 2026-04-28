import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../lib/tenancy/tenantService";
import PublicClubShell from "../../../components/publicSite/PublicClubShell";
import { getPublishedPublicPage } from "../../../lib/publicSite/publicPageService";

interface MembersPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function MembersPage({ params }: MembersPageProps) {
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

  const page = await getPublishedPublicPage(club.id, "members");

  return (
    <PublicClubShell club={club}>
      <div className="flex flex-col items-center justify-center p-6 text-slate-900 mt-12">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-sm border border-slate-200 p-12">
          <h1 className="text-4xl font-bold tracking-tight mb-6">
            {page?.title ?? "Members"}
          </h1>
          {/* Note: This is a public placeholder only, not a protected member area. */}
          <p className="text-lg text-slate-600">
            {page?.body ?? "Member access foundation will be added later."}
          </p>
        </div>
      </div>
    </PublicClubShell>
  );
}
