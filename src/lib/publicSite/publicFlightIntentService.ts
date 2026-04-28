import prisma from "../db/prisma";
import { ClubFlightIntentStatus, ClubFlightIntentVisibility } from "../../generated/prisma";

/**
 * Service for public-facing flight intent data.
 * All queries are scoped by clubId and restricted to ACTIVE + PUBLIC rows.
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
