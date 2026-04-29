import prisma from "@/lib/db/prisma";

/**
 * Gets the next sequential member number for a club.
 *
 * Rules:
 * - Find max memberNumber for current club.
 * - Return max + 1.
 * - If no member numbers exist, return 1.
 * - Tenant-scoped by clubId.
 *
 * @param clubId The ID of the club
 * @returns The next available member number
 */
export async function getNextMemberNumber(clubId: string): Promise<number> {
  const result = await prisma.clubMemberProfile.aggregate({
    where: {
      clubId,
    },
    _max: {
      memberNumber: true,
    },
  });

  const maxNumber = result._max.memberNumber;

  if (maxNumber === null) {
    return 1;
  }

  return maxNumber + 1;
}
