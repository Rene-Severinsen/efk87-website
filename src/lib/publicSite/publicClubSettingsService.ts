
import prisma from "@/lib/db/prisma";

export async function getPublicClubSettings(clubId: string) {
  return await prisma.clubSettings.findUnique({
    where: { clubId },
    select: {
      weatherLatitude: true,
      weatherLongitude: true,
      displayName: true,
      shortName: true,
      publicEmail: true,
      publicThemeMode: true
    }
  });
}
