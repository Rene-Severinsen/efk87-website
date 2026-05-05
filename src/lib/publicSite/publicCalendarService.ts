import prisma from "../db/prisma";
import { ClubCalendarEntry, PublicSurfaceVisibility } from "../../generated/prisma";

function getVisibilityFilter(viewer?: { isMember: boolean }): PublicSurfaceVisibility[] {
  return viewer?.isMember
    ? [PublicSurfaceVisibility.PUBLIC, PublicSurfaceVisibility.MEMBERS_ONLY]
    : [PublicSurfaceVisibility.PUBLIC];
}

export interface PublicCalendarEntry {
  id: string;
  title: string;
  startsAt: Date;
  endsAt: Date | null;
  location: string | null;
  descriptionHtml: string | null;
}

/**
 * Returns upcoming published calendar entries for the marquee.
 * 
 * Logic:
 * 1. Published upcoming entries (startsAt >= today).
 * 2. entries within the next 3 months from today.
 * 3. entries with forceShowInMarquee=true (even if beyond 3 months).
 * 4. Past entries are never shown.
 * 5. Sort by startsAt ascending.
 */
export async function getHomepageMarqueeCalendarEntries(
  clubId: string,
  viewer?: { isMember: boolean },
): Promise<PublicCalendarEntry[]> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const threeMonthsAhead = new Date(startOfToday);
  threeMonthsAhead.setMonth(threeMonthsAhead.getMonth() + 3);

  const entries = await prisma.clubCalendarEntry.findMany({
    where: {
      clubId,
      isPublished: true,
      visibility: { in: getVisibilityFilter(viewer) },
      startsAt: {
        gte: startOfToday
      },
      OR: [
        {
          startsAt: {
            lte: threeMonthsAhead
          }
        },
        {
          forceShowInMarquee: true
        }
      ]
    },
    orderBy: {
      startsAt: 'asc'
    }
  });

  return entries.map(mapToPublicEntry);
}

/**
 * Returns a single published calendar entry detail.
 */

/**
 * Returns all published calendar entries visible to the current public/member context.
 * Used by the public calendar overview page.
 */
export async function getPublicCalendarEntriesOverview(
  clubId: string,
  viewer?: { isMember?: boolean; isAdmin?: boolean } | null
): Promise<PublicCalendarEntry[]> {
  const visibleStates = viewer?.isMember || viewer?.isAdmin
    ? [PublicSurfaceVisibility.PUBLIC, PublicSurfaceVisibility.MEMBERS_ONLY]
    : [PublicSurfaceVisibility.PUBLIC];

  const entries = await prisma.clubCalendarEntry.findMany({
    where: {
      clubId,
      isPublished: true,
      visibility: { in: visibleStates },
    },
    orderBy: {
      startsAt: "asc",
    },
  });

  return entries.map(mapToPublicEntry);
}

export async function getPublicCalendarEntryDetail(
  clubId: string,
  entryId: string,
  viewer?: { isMember: boolean },
): Promise<PublicCalendarEntry | null> {
  const entry = await prisma.clubCalendarEntry.findFirst({
    where: {
      id: entryId,
      clubId,
      isPublished: true,
      visibility: { in: getVisibilityFilter(viewer) }
    }
  });

  if (!entry) return null;

  return mapToPublicEntry(entry);
}

function mapToPublicEntry(entry: ClubCalendarEntry): PublicCalendarEntry {
  return {
    id: entry.id,
    title: entry.title,
    startsAt: entry.startsAt,
    endsAt: entry.endsAt,
    location: entry.location,
    descriptionHtml: entry.descriptionHtml
  };
}
