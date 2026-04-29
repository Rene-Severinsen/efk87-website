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
  if (!viewer.isMember) {
    throw new Error("Unauthorized: Only active members can access this.");
  }

  // Identity strategy: use the same displayName logic as createFlightIntentAction
  const displayName = viewer.name || viewer.email || "Medlem";

  return prisma.clubFlightIntent.findMany({
    where: {
      clubId,
      displayName: displayName,
    },
    orderBy: [
      { flightDate: "desc" },
      { createdAt: "desc" },
    ],
    take: 10,
  });
}
