import { resolvePublicPageForClub } from "../../../lib/publicSite/publicPageRoute";
import PublicContentPage from "../../../components/publicSite/PublicContentPage";

interface MembersPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { clubSlug } = await params;
  const pageSlug = "members";
  const { club, page } = await resolvePublicPageForClub(clubSlug, pageSlug);

  return (
    <PublicContentPage
      club={club}
      title={page?.title ?? ""}
      body={page?.body ?? ""}
      fallbackTitle="Members"
      fallbackBody="Member access foundation will be added later."
    />
  );
}
