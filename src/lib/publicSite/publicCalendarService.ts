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
 * 1. Published upcoming entries (startsAt >= today).
 * 2. entries within the next 3 months from today.
 * 3. entries with forceShowInMarquee=true (even if beyond 3 months).
 * 4. Past entries are never shown.
 * 5. Sort by startsAt ascending.
 */
export async function getHomepageMarqueeCalendarEntries(clubId: string): Promise<PublicCalendarEntry[]> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const threeMonthsAhead = new Date(startOfToday);
  threeMonthsAhead.setMonth(threeMonthsAhead.getMonth() + 3);

  const entries = await prisma.clubCalendarEntry.findMany({
    where: {
      clubId,
      isPublished: true,
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
