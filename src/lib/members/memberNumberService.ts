import prisma from "@/lib/db/prisma";

/**
 * Gets the next sequential member number for a club.
 *
 * Rules:
 * - Find max memberNumber for current club in ClubMemberProfile.
 * - Return max + 1.
 * - If no member numbers exist, return 1.
 * - Tenant-scoped by clubId.
 */
export async function getNextMemberNumber(clubId: string): Promise<number> {
  const profileResult = await prisma.clubMemberProfile.aggregate({
    where: {
      clubId,
    },
    _max: {
      memberNumber: true,
    },
  });

  const maxProfile = profileResult._max.memberNumber;

  if (maxProfile === null) {
    return 1;
  }

  return maxProfile + 1;
}
