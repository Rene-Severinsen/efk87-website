import { notFound } from "next/navigation";
import { requireClubBySlug } from "../../../../lib/tenancy/tenantService";
import { getServerViewerForClub, toViewerVisibilityContext } from "../../../../lib/auth/viewer";
import { getClubTheme } from "../../../../lib/publicSite/publicThemeService";
import { getTodayFlightIntents } from "../../../../lib/publicSite/publicFlightIntentService";
import { getMemberActivityStats } from "../../../../lib/publicSite/memberActivityService";
import { getVisiblePublicNavigation, getVisiblePublicActions } from "../../../../lib/publicSite/publicNavigation";
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
    // If not a member and not in dev, we don't want to show the preview.
    notFound();
  }

  // Fetch real data
  const visibilityContext = toViewerVisibilityContext(viewer);
  const [theme, todayFlightIntents, memberActivity] = await Promise.all([
    getClubTheme(club.id),
    getTodayFlightIntents(club.id, visibilityContext),
    getMemberActivityStats(club.id),
  ]);

  const navigationItems = getVisiblePublicNavigation(clubSlug, visibilityContext);
  const actionItems = getVisiblePublicActions(clubSlug, visibilityContext);

  return (
    <PublicClubHomePageV2 
      club={club}
      viewer={viewer}
      theme={theme}
      todayFlightIntents={todayFlightIntents}
      memberActivity={memberActivity}
      navigationItems={navigationItems}
      actionItems={actionItems}
    />
  );
}
