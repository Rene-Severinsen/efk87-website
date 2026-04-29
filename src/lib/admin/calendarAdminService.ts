import prisma from "../db/prisma";

/**
 * Service for admin-facing calendar data.
 */

export async function getAdminCalendarEntries(clubId: string) {
  return prisma.clubCalendarEntry.findMany({
    where: {
      clubId,
    },
    orderBy: [
      { startsAt: 'desc' },
      { createdAt: 'desc' }
    ],
  });
}

export async function getAdminCalendarEntryById(clubId: string, entryId: string) {
  return prisma.clubCalendarEntry.findFirst({
    where: {
      id: entryId,
      clubId,
    },
  });
}
