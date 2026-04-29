import prisma from "../db/prisma";
import { ClubCalendarEntry } from "../../generated/prisma";

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
 * 1. Published upcoming entries ordered by startsAt ascending.
 * 2. Limit to 8 upcoming entries.
 * 3. Also include entries with forceShowInMarquee=true even if they are beyond the first 8.
 * 4. Past entries are hidden unless forceShowInMarquee=true and startsAt is still "relevant" 
 *    (for simplicity, we show them if startsAt is today or later, OR if forced).
 */
export async function getHomepageMarqueeCalendarEntries(clubId: string): Promise<PublicCalendarEntry[]> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 1. Get first 8 upcoming
  const upcoming = await prisma.clubCalendarEntry.findMany({
    where: {
      clubId,
      isPublished: true,
      startsAt: {
        gte: startOfToday
      }
    },
    orderBy: {
      startsAt: 'asc'
    },
    take: 8
  });

  // 2. Get forced entries that might be beyond the first 8 or in the past but still relevant
  // For "relevant", we'll include forced entries that are not older than 24 hours
  const forcedLimit = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const forced = await prisma.clubCalendarEntry.findMany({
    where: {
      clubId,
      isPublished: true,
      forceShowInMarquee: true,
      startsAt: {
        gte: forcedLimit
      },
      // Avoid fetching what we already have if possible, but easier to filter in JS
    },
    orderBy: {
      startsAt: 'asc'
    }
  });

  // Combine and deduplicate
  const allEntries = [...upcoming, ...forced];
  const uniqueEntries = Array.from(new Map(allEntries.map(item => [item.id, item])).values());

  // Re-sort by startsAt ascending
  uniqueEntries.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  return uniqueEntries.map(mapToPublicEntry);
}

/**
 * Returns a single published calendar entry detail.
 */
export async function getPublicCalendarEntryDetail(clubId: string, entryId: string): Promise<PublicCalendarEntry | null> {
  const entry = await prisma.clubCalendarEntry.findFirst({
    where: {
      id: entryId,
      clubId,
      isPublished: true
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
