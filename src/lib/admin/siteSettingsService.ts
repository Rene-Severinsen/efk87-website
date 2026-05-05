
import prisma from "@/lib/db/prisma";

export async function getClubSettings(clubId: string) {
  return await prisma.clubSettings.findUnique({
    where: { clubId }
  });
}

export async function updateClubWeatherSettings(clubId: string, lat: number | null, lon: number | null) {
  return await prisma.clubSettings.upsert({
    where: { clubId },
    create: {
      clubId,
      displayName: "", // These should ideally be pre-populated
      shortName: "",
      weatherLatitude: lat,
      weatherLongitude: lon,
      publicThemeMode: "light"
    },
    update: {
      weatherLatitude: lat,
      weatherLongitude: lon
    }
  });
}

export async function updateClubPublicTheme(clubId: string, themeMode: string) {
  if (themeMode !== "light" && themeMode !== "dark") {
    throw new Error("Invalid theme mode");
  }

  return await prisma.clubSettings.upsert({
    where: { clubId },
    create: {
      clubId,
      displayName: "",
      shortName: "",
      publicThemeMode: themeMode
    },
    update: {
      publicThemeMode: themeMode
    }
  });
}


export interface PublicHomepageSettingsInput {
  publicHeroImageUrl: string | null;
  publicHeroImageAltText: string | null;
  publicHeroTitle: string | null;
  publicHeroSubtitle: string | null;
  publicHeroPrimaryCtaLabel: string | null;
  publicHeroPrimaryCtaHref: string | null;
  publicHeroSecondaryCtaLabel: string | null;
  publicHeroSecondaryCtaHref: string | null;
  publicHeroTertiaryCtaLabel: string | null;
  publicHeroTertiaryCtaHref: string | null;
  publicHeroQuaternaryCtaLabel: string | null;
  publicHeroQuaternaryCtaHref: string | null;
  publicIntroTitle: string | null;
  publicIntroLinkLabel: string | null;
  publicIntroLinkHref: string | null;
  publicIntroCard1Icon: string | null;
  publicIntroCard1Title: string | null;
  publicIntroCard1Text: string | null;
  publicIntroCard1Href: string | null;
  publicIntroCard2Icon: string | null;
  publicIntroCard2Title: string | null;
  publicIntroCard2Text: string | null;
  publicIntroCard2Href: string | null;
  publicIntroCard3Icon: string | null;
  publicIntroCard3Title: string | null;
  publicIntroCard3Text: string | null;
  publicIntroCard3Href: string | null;
  publicCtaSectionTitle: string | null;
  publicCtaSectionLinkLabel: string | null;
  publicCtaSectionLinkHref: string | null;
  publicCtaBoxIcon: string | null;
  publicCtaBoxTitle: string | null;
  publicCtaBoxText: string | null;
  publicCtaPrimaryLabel: string | null;
  publicCtaPrimaryHref: string | null;
  publicCtaSecondaryLabel: string | null;
  publicCtaSecondaryHref: string | null;
}

export async function updatePublicHomepageSettings(
  clubId: string,
  data: PublicHomepageSettingsInput,
) {
  return await prisma.clubSettings.upsert({
    where: { clubId },
    create: {
      clubId,
      displayName: "",
      shortName: "",
      publicThemeMode: "light",
      ...data,
    },
    update: data,
  });
}
