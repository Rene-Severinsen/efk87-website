import prisma from "../db/prisma";
import { ServerViewerContext } from "../auth/viewer";

export interface LatestMemberActivityDTO {
  displayName: string;
  lastSeenAt: Date;
}

export interface MemberActivityStats {
  todayActiveCount: number;
  latestMembers: LatestMemberActivityDTO[];
}

/**
 * Records member activity for a specific club and user for today.
 * Rules:
 * - no-op for anonymous users
 * - no-op for authenticated users without ACTIVE membership
 * - require viewer.userId
 * - normalize today as activityDate
 * - upsert by clubId + userId + activityDate
 */
export async function recordMemberActivityForClub(clubId: string, viewer: ServerViewerContext) {
  if (!viewer.isAuthenticated || !viewer.userId || !viewer.isMember) {
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    await prisma.memberDailyActivity.upsert({
      where: {
        clubId_userId_activityDate: {
          clubId,
          userId: viewer.userId,
          activityDate: today,
        },
      },
      create: {
        clubId,
        userId: viewer.userId,
        activityDate: today,
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
      },
      update: {
        lastSeenAt: new Date(),
      },
    });
  } catch (error) {
    console.error("[memberActivityService] Failed to record activity:", error);
  }
}

/**
 * Counts unique MemberDailyActivity rows for clubId + today activityDate.
 */
export async function getTodayActiveMemberCount(clubId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return prisma.memberDailyActivity.count({
    where: {
      clubId,
      activityDate: today,
    },
  });
}

/**
 * Returns latest active members today for current club.
 * Rules:
 * - order by lastSeenAt desc
 * - limit to max 5 for homepage widget
 * - join/include User name/email
 * - if viewer.isMember or viewer.isAdmin: show real displayName
 * - otherwise: mask displayName as “Medlem”
 * - do not expose userId
 */
export async function getTodayLatestActiveMembers(
  clubId: string,
  viewer: ServerViewerContext
): Promise<LatestMemberActivityDTO[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activities = await prisma.memberDailyActivity.findMany({
    where: {
      clubId,
      activityDate: today,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      lastSeenAt: "desc",
    },
    take: 5,
  });

  const canSeeNames = viewer.isMember || viewer.isAdmin;

  return activities.map((activity) => {
    let displayName = "Medlem";
    if (canSeeNames) {
      displayName = activity.user.name || activity.user.email || "Medlem";
    }

    return {
      displayName,
      lastSeenAt: activity.lastSeenAt,
    };
  });
}

/**
 * Legacy wrapper for compatibility during transition if needed,
 * but the goal is to use the individual functions in the page.
 */
export async function getMemberActivityStats(
  clubId: string,
  viewer: ServerViewerContext
): Promise<MemberActivityStats> {
  const [todayActiveCount, latestMembers] = await Promise.all([
    getTodayActiveMemberCount(clubId),
    getTodayLatestActiveMembers(clubId, viewer),
  ]);

  return {
    todayActiveCount,
    latestMembers,
  };
}
