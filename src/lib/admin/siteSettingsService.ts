
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
      weatherLongitude: lon
    },
    update: {
      weatherLatitude: lat,
      weatherLongitude: lon
    }
  });
}
