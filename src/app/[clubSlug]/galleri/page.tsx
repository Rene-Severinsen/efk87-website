import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../lib/tenancy/tenantService";
import { getPublishedPublicPage } from "../../../lib/publicSite/publicPageService";
import PublicClubShell from "../../../components/publicSite/PublicClubShell";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function GalleriPage({ params }: PageProps) {
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

  const page = await getPublishedPublicPage(club.id, "galleri");

  if (!page) {
    notFound();
  }

  return (
    <PublicClubShell club={club}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">{page.title}</h1>
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-600">{page.body}</p>
        </div>
      </div>
    </PublicClubShell>
  );
}
