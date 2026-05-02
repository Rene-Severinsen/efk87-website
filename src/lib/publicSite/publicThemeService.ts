import prisma from "../db/prisma";

/**
 * Normalizes a theme value to either "light" or "dark".
 * Falls back to "light" if the value is missing or invalid.
 */
export function normalizePublicThemeMode(value: string | null | undefined): "light" | "dark" {
  if (value === "dark") {
    return "dark";
  }
  return "light";
}

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
