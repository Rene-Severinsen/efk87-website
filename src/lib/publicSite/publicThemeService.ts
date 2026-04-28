import prisma from "../db/prisma";

/**
 * Service to fetch theme settings for a club.
 * This is used for the public site to apply tenant-specific branding.
 */

export async function getClubTheme(clubId: string) {
  return prisma.clubTheme.findUnique({
    where: {
      clubId,
    },
  });
}
