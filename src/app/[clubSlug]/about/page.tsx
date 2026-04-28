import { resolvePublicPageForClub } from "../../../lib/publicSite/publicPageRoute";
import PublicContentPage from "../../../components/publicSite/PublicContentPage";

interface AboutPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { clubSlug } = await params;
  const pageSlug = "about";
  const { club, page } = await resolvePublicPageForClub(clubSlug, pageSlug);

  return (
    <PublicContentPage
      club={club}
      title={page?.title ?? ""}
      body={page?.body ?? ""}
      fallbackTitle={`About ${club.name}`}
      fallbackBody="Club profile content will be managed here."
    />
  );
}
