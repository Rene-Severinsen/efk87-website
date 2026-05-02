
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
