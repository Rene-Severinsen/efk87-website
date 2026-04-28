import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../lib/tenancy/tenantService";
import PublicClubShell from "../../../components/publicSite/PublicClubShell";
import { getPublishedPublicPage } from "../../../lib/publicSite/publicPageService";

interface AboutPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function AboutPage({ params }: AboutPageProps) {
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

  const page = await getPublishedPublicPage(club.id, "about");

  return (
    <PublicClubShell club={club}>
      <div className="flex flex-col items-center justify-center p-6 text-slate-900 mt-12">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-sm border border-slate-200 p-12">
          <h1 className="text-4xl font-bold tracking-tight mb-6">
            {page?.title ?? `About ${club.name}`}
          </h1>
          <p className="text-lg text-slate-600">
            {page?.body ?? "Club profile content will be managed here."}
          </p>
        </div>
      </div>
    </PublicClubShell>
  );
}
