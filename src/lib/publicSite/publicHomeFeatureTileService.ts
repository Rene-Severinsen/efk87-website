import prisma from "../db/prisma";
import { PublicSurfaceVisibility } from "../../generated/prisma";
import { ViewerVisibilityContext } from "./publicVisibility";

/**
 * Returns only active feature tiles for the given club, ordered by sortOrder ascending,
 * filtered by visibility based on the provided viewer context.
 */
export async function getActiveHomeFeatureTiles(
  clubId: string,
  viewer: ViewerVisibilityContext
) {
  const allowedVisibilities: PublicSurfaceVisibility[] = ["PUBLIC"];
  if (viewer.isAuthenticated && (viewer.isMember || viewer.isAdmin)) {
    allowedVisibilities.push("MEMBERS_ONLY");
  }

  return prisma.publicHomeFeatureTile.findMany({
    where: {
      clubId,
      isActive: true,
      visibility: {
        in: allowedVisibilities,
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
}
