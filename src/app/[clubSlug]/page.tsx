import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../lib/tenancy/tenantService";
import PublicClubHomePage from "../../components/publicSite/PublicClubHomePage";
import { getPublicHomePage } from "../../lib/publicSite/publicHomePageService";
import { getClubTheme } from "../../lib/publicSite/publicThemeService";
import { getActiveHomeFeatureTiles } from "../../lib/publicSite/publicHomeFeatureTileService";
import { getActiveFlightIntents } from "../../lib/publicSite/publicFlightIntentService";

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

  const homePage = await getPublicHomePage(club.id);
  const theme = await getClubTheme(club.id);
  const featureTiles = await getActiveHomeFeatureTiles(club.id);
  const flightIntents = await getActiveFlightIntents(club.id);
  
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
      flightIntents={flightIntents}
    />
  );
}
