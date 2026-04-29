import prisma from "../db/prisma";

export async function getAdminFlightIntentOverview(clubId: string) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [todayActive, todayCancelled, recent] = await Promise.all([
    // ACTIVE rows for today, ordered by createdAt descending
    prisma.clubFlightIntent.findMany({
      where: {
        clubId,
        status: "ACTIVE",
        flightDate: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      orderBy: [
        { createdAt: "desc" },
        { plannedAt: "desc" },
      ],
      select: {
        id: true,
        displayName: true,
        message: true,
        activityType: true,
        status: true,
        flightDate: true,
        plannedAt: true,
        createdAt: true,
        cancelledAt: true,
        visibility: true,
        source: true,
      },
    }),

    // CANCELLED rows for today, ordered by cancelledAt/createdAt descending
    prisma.clubFlightIntent.findMany({
      where: {
        clubId,
        status: "CANCELLED",
        flightDate: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      orderBy: [
        { createdAt: "desc" },
        { plannedAt: "desc" },
        { cancelledAt: "desc" },
      ],
      select: {
        id: true,
        displayName: true,
        message: true,
        activityType: true,
        status: true,
        flightDate: true,
        plannedAt: true,
        createdAt: true,
        cancelledAt: true,
        visibility: true,
        source: true,
      },
    }),

    // latest 25 rows across statuses, ordered by flightDate descending, createdAt descending
    prisma.clubFlightIntent.findMany({
      where: {
        clubId,
      },
      orderBy: [
        { createdAt: "desc" },
        { flightDate: "desc" },
        { plannedAt: "desc" },
      ],
      take: 25,
      select: {
        id: true,
        displayName: true,
        message: true,
        activityType: true,
        status: true,
        flightDate: true,
        plannedAt: true,
        createdAt: true,
        cancelledAt: true,
        visibility: true,
        source: true,
      },
    }),
  ]);

  return {
    todayActive,
    todayCancelled,
    recent,
  };
}
