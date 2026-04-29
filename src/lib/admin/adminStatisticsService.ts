import prisma from "../db/prisma";
import { startOfDay, endOfDay, subDays, startOfYear } from "date-fns";

export interface AdminStatisticsOverview {
  dailySeries: {
    date: string;
    uniqueActiveMembers: number;
    flightIntentCount: number;
  }[];
  today: {
    uniqueActiveMembersToday: number;
    flightIntentCountToday: number;
    activeFlightIntentCountToday: number;
    cancelledFlightIntentCountToday: number;
  };
  year: {
    flightIntentCountThisYear: number;
    uniqueFlightIntentUsersThisYear: number;
  };
  club: {
    activeMemberCount: number;
  };
  latestActiveMembersToday: {
    displayName: string;
    lastSeenAt: Date;
  }[];
  topFlightIntentUsersThisYear: {
    displayName: string;
    count: number;
  }[];
}

/**
 * Get admin statistics overview for a specific club.
 * Timezone assumption: Server-local day boundaries are used via date-fns.
 */
export async function getAdminStatisticsOverview(clubId: string): Promise<AdminStatisticsOverview> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const yearStart = startOfYear(now);
  
  // 1. Daily series (latest 14 days)
  const fourteenDaysAgo = startOfDay(subDays(now, 13));
  
  const dailyActivity = await prisma.memberDailyActivity.findMany({
    where: {
      clubId,
      activityDate: {
        gte: fourteenDaysAgo,
        lte: todayEnd,
      },
    },
    orderBy: {
      activityDate: "asc",
    },
  });

  const dailyFlightIntents = await prisma.clubFlightIntent.findMany({
    where: {
      clubId,
      flightDate: {
        gte: fourteenDaysAgo,
        lte: todayEnd,
      },
    },
  });

  // Map to series
  const dailySeriesMap = new Map<string, { uniqueActiveMembers: number; flightIntentCount: number }>();
  for (let i = 0; i < 14; i++) {
    const d = startOfDay(subDays(now, i));
    dailySeriesMap.set(d.toISOString().split("T")[0], { uniqueActiveMembers: 0, flightIntentCount: 0 });
  }

  dailyActivity.forEach((activity) => {
    const dateStr = activity.activityDate.toISOString().split("T")[0];
    const current = dailySeriesMap.get(dateStr);
    if (current) {
      current.uniqueActiveMembers++;
    }
  });

  dailyFlightIntents.forEach((intent) => {
    const dateStr = intent.flightDate.toISOString().split("T")[0];
    const current = dailySeriesMap.get(dateStr);
    if (current) {
      current.flightIntentCount++;
    }
  });

  const dailySeries = Array.from(dailySeriesMap.entries())
    .map(([date, data]) => ({
      date,
      ...data,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 2. Today
  const uniqueActiveMembersToday = await prisma.memberDailyActivity.count({
    where: {
      clubId,
      activityDate: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  const flightIntentsToday = await prisma.clubFlightIntent.findMany({
    where: {
      clubId,
      flightDate: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  const flightIntentCountToday = flightIntentsToday.length;
  const activeFlightIntentCountToday = flightIntentsToday.filter(i => i.status === "ACTIVE").length;
  const cancelledFlightIntentCountToday = flightIntentsToday.filter(i => i.status === "CANCELLED").length;

  // 3. Year
  const flightIntentCountThisYear = await prisma.clubFlightIntent.count({
    where: {
      clubId,
      flightDate: {
        gte: yearStart,
      },
    },
  });

  const uniqueUsersYear = await prisma.clubFlightIntent.groupBy({
    by: ["userId"],
    where: {
      clubId,
      flightDate: {
        gte: yearStart,
      },
    },
  });
  const uniqueFlightIntentUsersThisYear = uniqueUsersYear.length;

  // 4. Club
  const activeMemberCount = await prisma.clubMembership.count({
    where: {
      clubId,
      status: "ACTIVE",
    },
  });

  // 5. Latest active members today
  const latestActivityToday = await prisma.memberDailyActivity.findMany({
    where: {
      clubId,
      activityDate: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      lastSeenAt: "desc",
    },
    take: 20,
  });

  const latestActiveMembersToday = latestActivityToday.map(a => ({
    displayName: a.user.name || "Unknown",
    lastSeenAt: a.lastSeenAt,
  }));

  // 6. Top flight intent users this year
  const topUsersQuery = await prisma.clubFlightIntent.groupBy({
    by: ["userId", "displayName"],
    where: {
      clubId,
      flightDate: {
        gte: yearStart,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 10,
  });

  const topFlightIntentUsersThisYear = topUsersQuery.map(u => ({
    displayName: u.displayName,
    count: u._count.id,
  }));

  return {
    dailySeries,
    today: {
      uniqueActiveMembersToday,
      flightIntentCountToday,
      activeFlightIntentCountToday,
      cancelledFlightIntentCountToday,
    },
    year: {
      flightIntentCountThisYear,
      uniqueFlightIntentUsersThisYear,
    },
    club: {
      activeMemberCount,
    },
    latestActiveMembersToday,
    topFlightIntentUsersThisYear,
  };
}
