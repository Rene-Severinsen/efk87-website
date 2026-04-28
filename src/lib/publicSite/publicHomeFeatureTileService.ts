import prisma from "../db/prisma";

/**
 * Returns only active feature tiles for the given club, ordered by sortOrder ascending.
 */
export async function getActiveHomeFeatureTiles(clubId: string) {
  return prisma.publicHomeFeatureTile.findMany({
    where: {
      clubId,
      isActive: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
}
