import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../lib/tenancy/tenantService";
import PublicClubHomePage from "../../components/publicSite/PublicClubHomePage";
import { getPublicHomePage } from "../../lib/publicSite/publicHomePageService";
import { getClubTheme } from "../../lib/publicSite/publicThemeService";
import { getActiveHomeFeatureTiles } from "../../lib/publicSite/publicHomeFeatureTileService";
import { getActiveHomeInfoCards } from "../../lib/publicSite/publicHomeInfoCardService";
import { getTodayFlightIntents } from "../../lib/publicSite/publicFlightIntentService";
import { getPublicFooterData } from "../../lib/publicSite/publicFooterService";
import { anonymousViewer } from "../../lib/publicSite/publicVisibility";
import { getVisiblePublicNavigation, getVisiblePublicActions } from "../../lib/publicSite/publicNavigation";

interface ClubPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function ClubPage({ params }: ClubPageProps) {
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

  // Currently authentication is not implemented, so we use the anonymous viewer.
  // In the future, this will be resolved from the session.
  const viewer = anonymousViewer;

  const homePage = await getPublicHomePage(club.id);
  const theme = await getClubTheme(club.id);
  const featureTiles = await getActiveHomeFeatureTiles(club.id, viewer);
  const infoCards = await getActiveHomeInfoCards(club.id, viewer);
  const flightIntents = await getTodayFlightIntents(club.id, viewer);
  const footerData = await getPublicFooterData(club.id);
  const navigationItems = getVisiblePublicNavigation(clubSlug, viewer);
  const actionItems = getVisiblePublicActions(clubSlug, viewer);
  
  // Prepare content from homePage or use empty object
  // Based on PublicPage model: title, body, excerpt
  const content = homePage ? {
    heroTitle: homePage.title,
    heroSubtitle: homePage.excerpt || undefined,
    introBody: homePage.body,
  } : {};

  return (
    <PublicClubHomePage 
      clubName={club.settings?.shortName || club.name} 
      clubDisplayName={club.settings?.displayName || club.name}
      content={content}
      theme={theme || undefined}
      featureTiles={featureTiles}
      infoCards={infoCards}
      flightIntents={flightIntents}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
    />
  );
}
