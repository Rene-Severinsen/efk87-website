import type { Metadata } from "next";
import prisma from "../db/prisma";

export async function getClubBrandingMetadata(clubSlug: string): Promise<Metadata> {
  const club = await prisma.club.findUnique({
    where: {
      slug: clubSlug,
    },
    select: {
      name: true,
      settings: {
        select: {
          logoUrl: true,
          faviconUrl: true,
          appleIconUrl: true,
        },
      },
    },
  });

  if (!club?.settings) {
    return {};
  }

  const icons: NonNullable<Metadata["icons"]> = {};

  if (club.settings.faviconUrl) {
    icons.icon = [
      {
        url: club.settings.faviconUrl,
        type: "image/png",
        sizes: "32x32",
      },
    ];
    icons.shortcut = club.settings.faviconUrl;
  }

  if (club.settings.appleIconUrl) {
    icons.apple = [
      {
        url: club.settings.appleIconUrl,
        type: "image/png",
        sizes: "180x180",
      },
    ];
  }

  return {
    icons,
  };
}
