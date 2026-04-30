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
  const profileResult = await prisma.clubMemberProfile.aggregate({
    where: {
      clubId,
    },
    _max: {
      memberNumber: true,
    },
  });

  const applicationResult = await prisma.publicMemberApplication.aggregate({
    where: {
      clubId,
    },
    _max: {
      memberNumber: true,
    },
  });

  const maxProfile = profileResult._max.memberNumber ?? 0;
  const maxApplication = applicationResult._max.memberNumber ?? 0;

  const maxNumber = Math.max(maxProfile, maxApplication);

  if (maxNumber === 0) {
    // Check if any record actually has 0 or if both were null
    const hasProfile = await prisma.clubMemberProfile.count({ where: { clubId, memberNumber: 0 } });
    const hasApp = await prisma.publicMemberApplication.count({ where: { clubId, memberNumber: 0 } });
    if (hasProfile === 0 && hasApp === 0 && maxProfile === 0 && maxApplication === 0) {
       // if we got 0 it might be because they are all null, or because some are 0.
       // aggregate _max returns null if no rows or all null. 
       // If we get null for both, maxNumber is 0.
       // We should return 1.
    }
  }

  if (profileResult._max.memberNumber === null && applicationResult._max.memberNumber === null) {
    return 1;
  }

  return maxNumber + 1;
}
