import prisma from "../db/prisma";

/**
 * Service to fetch public footer data for a club.
 * This includes the footer description, contact info, and active sponsors.
 */
export async function getPublicFooterData(clubId: string) {
  const [footer, sponsors] = await Promise.all([
    prisma.publicClubFooter.findUnique({
      where: { clubId },
    }),
    prisma.publicSponsor.findMany({
      where: {
        clubId,
        isActive: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    }),
  ]);

  return {
    footer,
    sponsors: sponsors || [],
  };
}
