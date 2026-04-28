import prisma from "../db/prisma";
import { ClubFlightIntentStatus, ClubFlightIntentVisibility } from "../../generated/prisma";
import { ViewerVisibilityContext } from "./publicVisibility";

/**
 * Service for public-facing flight intent data.
 * All queries are scoped by clubId and restricted by visibility.
 */

/**
 * Returns all active flight intents for a club, filtered by visibility.
 * Note: This includes future intents. Use getTodayFlightIntents for the daily presence list.
 */
export async function getActiveFlightIntents(
  clubId: string,
  viewer: ViewerVisibilityContext
) {
  const allowedVisibilities: ClubFlightIntentVisibility[] = ["PUBLIC"];
  if (viewer.isAuthenticated && (viewer.isMember || viewer.isAdmin)) {
    allowedVisibilities.push("MEMBERS_ONLY");
  }

  return prisma.clubFlightIntent.findMany({
    where: {
      clubId,
      status: ClubFlightIntentStatus.ACTIVE,
      visibility: {
        in: allowedVisibilities,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });
}

/**
 * Returns active flight intents for today's daily presence list, filtered by visibility.
 */
export async function getTodayFlightIntents(
  clubId: string,
  viewer: ViewerVisibilityContext
) {
  const allowedVisibilities: ClubFlightIntentVisibility[] = ["PUBLIC"];
  if (viewer.isAuthenticated && (viewer.isMember || viewer.isAdmin)) {
    allowedVisibilities.push("MEMBERS_ONLY");
  }

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  return prisma.clubFlightIntent.findMany({
    where: {
      clubId,
      status: ClubFlightIntentStatus.ACTIVE,
      visibility: {
        in: allowedVisibilities,
      },
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
