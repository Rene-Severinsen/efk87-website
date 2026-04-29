import prisma from "../db/prisma";

export interface LatestMemberActivity {
  id: string;
  name: string | null;
  lastSeenAt: Date;
}

export interface MemberActivityStats {
  todayActiveCount: number;
  latestMembers: LatestMemberActivity[];
}

/**
 * Minimal service for member activity.
 */
export async function getMemberActivityStats(clubId: string): Promise<MemberActivityStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch count of unique members active today
  const activeTodayCount = await prisma.user.count({
    where: {
      lastSeenAt: {
        gte: today,
      },
      memberships: {
        some: {
          clubId: clubId,
          status: 'ACTIVE',
        },
      },
    },
  });

  // Fetch latest active members today
  const latestMembers = await prisma.user.findMany({
    where: {
      lastSeenAt: {
        gte: today,
      },
      memberships: {
        some: {
          clubId: clubId,
          status: 'ACTIVE',
        },
      },
    },
    select: {
      id: true,
      name: true,
      lastSeenAt: true,
    },
    orderBy: {
      lastSeenAt: 'desc',
    },
    take: 5,
  });

  return {
    todayActiveCount: activeTodayCount,
    latestMembers: latestMembers.map(m => ({
      id: m.id,
      name: m.name,
      lastSeenAt: m.lastSeenAt as Date,
    })),
  };
}
