import prisma from "../db/prisma";
import { ClubFlightIntentStatus, ClubFlightIntentVisibility } from "../../generated/prisma";

/**
 * Service for public-facing flight intent data.
 * All queries are scoped by clubId and restricted to ACTIVE + PUBLIC rows.
 */

/**
 * Returns all active public flight intents for a club.
 * Note: This includes future intents. Use getTodayFlightIntents for the daily presence list.
 */
export async function getActiveFlightIntents(clubId: string) {
  return prisma.clubFlightIntent.findMany({
    where: {
      clubId,
      status: ClubFlightIntentStatus.ACTIVE,
      visibility: ClubFlightIntentVisibility.PUBLIC,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });
}

/**
 * Returns active public flight intents for today's daily presence list.
 */
export async function getTodayFlightIntents(clubId: string) {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  return prisma.clubFlightIntent.findMany({
    where: {
      clubId,
      status: ClubFlightIntentStatus.ACTIVE,
      visibility: ClubFlightIntentVisibility.PUBLIC,
      flightDate: {
        gte: startOfToday,
        lte: endOfToday,
      },
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });
}
