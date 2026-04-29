import { notFound } from "next/navigation";
import { requireClubBySlug } from "../../../../lib/tenancy/tenantService";
import { getServerViewerForClub } from "../../../../lib/auth/viewer";
import PublicClubHomePageV2 from "../../../../components/publicSite/homeV2/PublicClubHomePageV2";

interface PreviewPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { clubSlug } = await params;

  // Resolve club
  let club;
  try {
    club = await requireClubBySlug(clubSlug);
  } catch {
    notFound();
  }

  // Require active member or development mode
  const viewer = await getServerViewerForClub(club.id);
  const isDev = process.env.NODE_ENV === "development";
  
  if (!viewer.isMember && !isDev) {
    // If not a member and not in dev, we don\"t want to show the preview.
    notFound();
  }

  return <PublicClubHomePageV2 />;
}
