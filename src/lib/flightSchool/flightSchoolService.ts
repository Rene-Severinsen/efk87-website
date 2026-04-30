import prisma from "../db/prisma";

/**
 * Service for public-facing Flight School CMS content.
 */
export async function getPublishedFlightSchoolPage(clubId: string) {
  return prisma.flightSchoolPage.findFirst({
    where: {
      clubId,
      isPublished: true,
    },
  });
}

/**
 * Service for fetching all published documents for a club's flight school.
 */
export async function getPublishedFlightSchoolDocuments(clubId: string) {
  return prisma.flightSchoolDocument.findMany({
    where: {
      clubId,
      isPublished: true,
    },
    orderBy: [
      { sortOrder: "asc" },
      { title: "asc" },
    ],
  });
}

/**
 * Service for fetching a specific published document by its slug.
 */
export async function getPublishedFlightSchoolDocumentBySlug(clubId: string, slug: string) {
  return prisma.flightSchoolDocument.findFirst({
    where: {
      clubId,
      slug,
      isPublished: true,
    },
  });
}
