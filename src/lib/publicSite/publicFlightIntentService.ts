import { getMemberDisplayName } from "../members/memberUtils";
import prisma from "../db/prisma";
import { ClubFlightIntentStatus, ClubFlightIntentVisibility, ClubFlightIntentType, ClubFlightIntent } from "../../generated/prisma";
import { ViewerVisibilityContext } from "./publicVisibility";

/**
 * Public DTO for flight intent display rows.
 * Includes only fields required for display to protect privacy.
 */
export interface PublicFlightIntentListItem {
  id: string;
  displayName: string;
  profileImageUrl?: string | null;
  message: string | null;
  activityType: ClubFlightIntentType;
  createdAt: Date;
}

/**
 * Service for public-facing flight intent data.
 * All queries are scoped by clubId and restricted by visibility.
 */

/**
 * Helper to mask display names for anonymous visitors.
 */
function maskFlightIntents(
  intents: (ClubFlightIntent & {
    user: {
      name: string | null;
      email: string;
      image: string | null;
      memberProfiles: {
        firstName: string | null;
        lastName: string | null;
      }[];
    };
  })[],
  viewer: ViewerVisibilityContext
): PublicFlightIntentListItem[] {
  const canSeeRealNames = viewer.isAuthenticated && (viewer.isMember || viewer.isAdmin);

  return intents.map((intent) => {
    let displayName = "Medlem";
    let profileImageUrl: string | null = null;

    if (canSeeRealNames) {
      // Use the helper to get the real display name from profile/user
      const profile = intent.user.memberProfiles[0] || { firstName: null, lastName: null };
      displayName = getMemberDisplayName(profile, intent.user);
      profileImageUrl = intent.user.image;
    }

    return {
      id: intent.id,
      displayName,
      profileImageUrl,
      message: intent.message,
      activityType: intent.activityType,
      createdAt: intent.createdAt,
    };
  });
}

/**
 * Returns all active flight intents for a club, filtered by visibility.
 * Note: This includes future intents. Use getTodayFlightIntents for the daily presence list.
 */
export async function getActiveFlightIntents(
  clubId: string,
  viewer: ViewerVisibilityContext
): Promise<PublicFlightIntentListItem[]> {
  const allowedVisibilities: ClubFlightIntentVisibility[] = ["PUBLIC"];
  if (viewer.isAuthenticated && (viewer.isMember || viewer.isAdmin)) {
    allowedVisibilities.push("MEMBERS_ONLY");
  }

  const intents = await prisma.clubFlightIntent.findMany({
    where: {
      clubId,
      status: ClubFlightIntentStatus.ACTIVE,
      visibility: {
        in: allowedVisibilities,
      },
    },
    include: {
      user: {
        include: {
          memberProfiles: {
            where: {
              clubId,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });

  return maskFlightIntents(intents, viewer);
}

/**
 * Returns active flight intents for today's daily presence list, filtered by visibility.
 */
export async function getTodayFlightIntents(
  clubId: string,
  viewer: ViewerVisibilityContext
): Promise<PublicFlightIntentListItem[]> {
  const allowedVisibilities: ClubFlightIntentVisibility[] = ["PUBLIC"];
  if (viewer.isAuthenticated && (viewer.isMember || viewer.isAdmin)) {
    allowedVisibilities.push("MEMBERS_ONLY");
  }

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const intents = await prisma.clubFlightIntent.findMany({
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
    include: {
      user: {
        include: {
          memberProfiles: {
            where: {
              clubId,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });

  return maskFlightIntents(intents, viewer);
}

/**
 * Returns all active flight intents for today's daily presence list.
 * Only returns PUBLIC visibility intents for public-facing list.
 */
export async function getTodayFlightIntentList(
  clubId: string,
  viewer: ViewerVisibilityContext
): Promise<PublicFlightIntentListItem[]> {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const intents = await prisma.clubFlightIntent.findMany({
    where: {
      clubId,
      status: ClubFlightIntentStatus.ACTIVE,
      visibility: "PUBLIC",
      flightDate: {
        gte: startOfToday,
        lte: endOfToday,
      },
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } },
      ],
    },
    include: {
      user: {
        include: {
          memberProfiles: {
            where: {
              clubId,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return maskFlightIntents(intents, viewer);
}
