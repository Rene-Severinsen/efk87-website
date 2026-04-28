import { notFound } from "next/navigation";
import { resolvePublicPageForClub } from "../../../lib/publicSite/publicPageRoute";
import PublicContentPage from "../../../components/publicSite/PublicContentPage";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function BlivMedlemPage({ params }: PageProps) {
  const { clubSlug } = await params;
  const pageSlug = "bliv-medlem";
  const { club, page } = await resolvePublicPageForClub(clubSlug, pageSlug);

  if (!page) {
    notFound();
  }

  return (
    <PublicContentPage
      club={club}
      title={page.title}
      body={page.body}
      variant="full"
    />
  );
}
