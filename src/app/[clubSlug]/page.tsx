import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../lib/tenancy/tenantService";
import PublicClubHomePageV2 from "../../components/publicSite/homeV2/PublicClubHomePageV2";
import { getPublicHomePage } from "../../lib/publicSite/publicHomePageService";
import { getClubTheme } from "../../lib/publicSite/publicThemeService";
import { getActiveHomeFeatureTiles } from "../../lib/publicSite/publicHomeFeatureTileService";
import { getActiveHomeInfoCards } from "../../lib/publicSite/publicHomeInfoCardService";
import { getTodayFlightIntents } from "../../lib/publicSite/publicFlightIntentService";
import { getPublicFooterData } from "../../lib/publicSite/publicFooterService";
import {
  getServerViewerForClub,
  toViewerVisibilityContext,
} from "../../lib/auth/viewer";
import {
  getVisiblePublicNavigation,
  getVisiblePublicActions,
} from "../../lib/publicSite/publicNavigation";

interface ClubPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function ClubPage({ params }: ClubPageProps) {
  const { clubSlug } = await params;

  // console.log("[ClubPage] PAGE PARAM clubSlug:", clubSlug);

  let club;

  try {
    club = await requireClubBySlug(clubSlug);

    // console.log("[ClubPage] RESOLVED CLUB:", {
    //   id: club.id,
    //   name: club.name,
    //   slug: club.slug,
    //   settings: club.settings,
    // });
  } catch (error) {
    console.error("[ClubPage] FAILED TO RESOLVE CLUB:", {
      clubSlug,
      error,
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

  console.log("[ClubPage] VIEWER:", viewer);

  const homePage = await getPublicHomePage(club.id);
  const theme = await getClubTheme(club.id);
  const featureTiles = await getActiveHomeFeatureTiles(club.id, viewer);
  const infoCards = await getActiveHomeInfoCards(club.id, viewer);
  const flightIntents = await getTodayFlightIntents(club.id, viewer);
  const footerData = await getPublicFooterData(club.id);
  const navigationItems = getVisiblePublicNavigation(clubSlug, viewer);
  const actionItems = getVisiblePublicActions(clubSlug, viewer);

  console.log("[ClubPage] DATA SUMMARY:", {
    clubId: club.id,
    hasHomePage: Boolean(homePage),
    homePage,
    hasTheme: Boolean(theme),
    featureTilesCount: featureTiles.length,
    infoCardsCount: infoCards.length,
    flightIntentsCount: flightIntents.length,
    hasFooterData: Boolean(footerData),
    navigationItems: navigationItems.map((item) => ({
      key: item.key,
      label: item.label,
      href: item.href,
      visibility: item.visibility,
    })),
    actionItems: actionItems.map((item) => ({
      key: item.key,
      label: item.label,
      href: item.href,
      visibility: item.visibility,
    })),
  });

  // Temporary mapping because getPublicHomePage currently returns PublicPage,
  // not the dedicated PublicHomePage model.
  const content = homePage
      ? {
        heroTitle: homePage.title,
        heroSubtitle: homePage.excerpt || undefined,
        introBody: homePage.body,
      }
      : {};

  console.log("[ClubPage] CONTENT:", content);

  return (
      <PublicClubHomePageV2
          club={club}
          viewer={serverViewer}
          theme={theme}
          todayFlightIntents={flightIntents}
          navigationItems={navigationItems}
          actionItems={actionItems}
      />
  );
}