import { notFound } from "next/navigation";
import { requireClubBySlug } from "../../../../lib/tenancy/tenantService";
import { toViewerVisibilityContext } from "../../../../lib/auth/viewer";
import { requireActiveMemberForClub } from "../../../../lib/auth/accessGuards";
import { getClubTheme } from "../../../../lib/publicSite/publicThemeService";
import { getTodayFlightIntents } from "../../../../lib/publicSite/publicFlightIntentService";
import { getMemberActivityStats } from "../../../../lib/memberActivity/memberActivityService";
import { getVisiblePublicNavigation, getVisiblePublicActions } from "../../../../lib/publicSite/publicNavigation";
import { getNewMemberHighlights } from "../../../../lib/members/newMemberHighlightService";
import { getHomepageMarqueeCalendarEntries } from "../../../../lib/publicSite/publicCalendarService";
import { getLatestForumActivity } from "../../../../lib/forum/forumService";
import { getActiveHomepageContentForClub } from "../../../../lib/homepageContent/homepageContentService";
import { getFlightSchoolHomepageView } from "../../../../lib/flightSchool/flightSchoolBookingService";
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

  // Require active member.
  const viewer = await requireActiveMemberForClub(club.id, clubSlug, `/${clubSlug}/preview/home-v2`);

  // Fetch real data
  const visibilityContext = toViewerVisibilityContext(viewer);
  const [theme, todayFlightIntents, memberActivity, newMemberHighlights, calendarMarquee, latestForumActivity, homepageContents, flightSchoolHomepage] = await Promise.all([
    getClubTheme(club.id),
    getTodayFlightIntents(club.id, visibilityContext),
    getMemberActivityStats(club.id, viewer),
    getNewMemberHighlights(club.id),
    getHomepageMarqueeCalendarEntries(club.id),
    getLatestForumActivity(club.id),
    getActiveHomepageContentForClub(club.id, visibilityContext),
    getFlightSchoolHomepageView(club.id),
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
      newMemberHighlights={newMemberHighlights}
      calendarMarquee={calendarMarquee}
      latestForumActivity={latestForumActivity}
      homepageContents={homepageContents}
      flightSchoolHomepage={flightSchoolHomepage}
    />
  );
}
