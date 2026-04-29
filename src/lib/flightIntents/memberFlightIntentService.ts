import prisma from "../db/prisma";
import { ServerViewerContext } from "../auth/viewer";
import { ClubFlightIntent, ClubFlightIntentStatus } from "../../generated/prisma";

/**
 * Service for member-specific flight intent operations.
 */
export async function getMemberRecentFlightIntents(
  clubId: string,
  viewer: ServerViewerContext
): Promise<ClubFlightIntent[]> {
  if (!viewer.isMember || !viewer.userId) {
    throw new Error("Unauthorized: Only active members can access this.");
  }

  return prisma.clubFlightIntent.findMany({
    where: {
      clubId,
      userId: viewer.userId,
    },
    orderBy: [
      { flightDate: "desc" },
      { createdAt: "desc" },
    ],
    take: 10,
  });
}

/**
 * Checks if a member already has an active flight intent for a specific date.
 */
export async function getActiveFlightIntentForMemberDate(
  clubId: string,
  userId: string,
  flightDate: Date
): Promise<ClubFlightIntent | null> {
  const normalizedDate = new Date(flightDate);
  normalizedDate.setHours(0, 0, 0, 0);

  return prisma.clubFlightIntent.findFirst({
    where: {
      clubId,
      userId,
      flightDate: normalizedDate,
      status: ClubFlightIntentStatus.ACTIVE,
    },
  });
}
