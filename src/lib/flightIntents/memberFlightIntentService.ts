import prisma from "../db/prisma";
import { ServerViewerContext } from "../auth/viewer";
import { ClubFlightIntent } from "../../generated/prisma";

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
