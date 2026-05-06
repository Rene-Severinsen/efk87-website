import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../lib/tenancy/tenantService";
import PublicClubHomePageV2 from "../../components/publicSite/homeV2/PublicClubHomePageV2";
import { getClubTheme } from "../../lib/publicSite/publicThemeService";
import { getTodayFlightIntents } from "../../lib/publicSite/publicFlightIntentService";
import { 
  getMemberActivityStats, 
  recordMemberActivityForClub 
} from "../../lib/memberActivity/memberActivityService";
import { getPublicFooterData } from "../../lib/publicSite/publicFooterService";
import {
  getServerViewerForClub,
  toViewerVisibilityContext,
} from "../../lib/auth/viewer";
import {
  getVisiblePublicNavigation,
  getVisiblePublicActions,
} from "../../lib/publicSite/publicNavigation";
import { getNewMemberHighlights } from "../../lib/members/newMemberHighlightService";
import { getTodayBirthdayHighlights } from "../../lib/members/birthdayHighlightService";
import { getHomepageMarqueeCalendarEntries } from "../../lib/publicSite/publicCalendarService";
import { getLatestForumActivity } from "../../lib/forum/forumService";
import { getPublicClubSettings } from "../../lib/publicSite/publicClubSettingsService";
import { getOpenMeteoWeather } from "../../lib/weather/openMeteoWeatherService";
import { getActiveHomepageContentForClub } from "../../lib/homepageContent/homepageContentService";
import { getFlightSchoolHomepageView } from "../../lib/flightSchool/flightSchoolBookingService";
import { getHomepageGalleryPreview } from "../../lib/gallery/galleryService";
import { getClubBrandingMetadata } from "../../lib/branding/clubBrandingMetadata";

interface ClubPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function ClubPage({ params }: ClubPageProps) {
  const { clubSlug } = await params;

  const reservedSlugs = ["favicon.ico", "admin", "api", "static", "images"];
  if (reservedSlugs.includes(clubSlug)) {
    notFound();
  }

  // console.log("[ClubPage] PAGE PARAM clubSlug:", clubSlug);

  let club;

  try {
    club = await requireClubBySlug(clubSlug);
  } catch (error) {
    console.error("[ClubPage] FAILED TO RESOLVE CLUB:", {
      clubSlug,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    });

    if (error instanceof TenancyError) {
      console.error("[ClubPage] TenancyError -> returning notFound()", {
        clubSlug,
        message: error.message,
      });

      notFound();
    }

    throw error;
  }

  const serverViewer = await getServerViewerForClub(club.id);
  const viewer = toViewerVisibilityContext(serverViewer);

  // console.log("[ClubPage] VIEWER:", viewer);

  const theme = await getClubTheme(club.id);
  const flightIntents = await getTodayFlightIntents(club.id, viewer);
  
  // Record activity for the current member
  await recordMemberActivityForClub(club.id, serverViewer);

  const memberActivity = await getMemberActivityStats(club.id, serverViewer);
  const footerData = await getPublicFooterData(club.id);
  const navigationItems = getVisiblePublicNavigation(clubSlug, viewer);
  const actionItems = getVisiblePublicActions(clubSlug, viewer);
  const newMemberHighlights = await getNewMemberHighlights(club.id);
  const birthdayHighlights = await getTodayBirthdayHighlights(club.id);
  const calendarMarquee = await getHomepageMarqueeCalendarEntries(club.id, viewer);
  const latestForumActivity = await getLatestForumActivity(club.id);
  const homepageContents = await getActiveHomepageContentForClub(club.id, viewer);
  const flightSchoolHomepage = await getFlightSchoolHomepageView(club.id);
  const galleryPreview = await getHomepageGalleryPreview(club.id, viewer);
  const publicSettings = await getPublicClubSettings(club.id);
  
  const weather = await getOpenMeteoWeather(
    publicSettings?.weatherLatitude,
    publicSettings?.weatherLongitude
  );

  const surface = viewer.isMember || viewer.isAdmin ? "member" : "public";

  return (
      <PublicClubHomePageV2
          club={{
            ...club,
            settings: publicSettings
          }}
          viewer={serverViewer}
          surface={surface}
          currentPath={`/${clubSlug}`}
          theme={theme}
          todayFlightIntents={flightIntents}
          memberActivity={memberActivity}
          navigationItems={navigationItems}
          actionItems={actionItems}
          newMemberHighlights={newMemberHighlights}
          birthdayHighlights={birthdayHighlights}
          calendarMarquee={calendarMarquee}
          latestForumActivity={latestForumActivity}
          homepageContents={homepageContents}
          flightSchoolHomepage={flightSchoolHomepage}
          weather={weather}
          footerData={footerData}
          galleryPreview={galleryPreview}
      />
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clubSlug: string }>;
}): Promise<Metadata> {
  const { clubSlug } = await params;

  return getClubBrandingMetadata(clubSlug);
}
