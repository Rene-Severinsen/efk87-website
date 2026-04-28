import prisma from "../db/prisma";

/**
 * Returns only active homepage info cards for the given club, ordered by sortOrder ascending.
 */
export async function getActiveHomeInfoCards(clubId: string) {
  return prisma.publicHomeInfoCard.findMany({
    where: {
      clubId,
      isActive: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
}
