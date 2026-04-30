import prisma from "../db/prisma";

export async function getAdminFlightSchoolPage(clubId: string) {
  return prisma.flightSchoolPage.findUnique({
    where: { clubId },
  });
}

export async function getAdminFlightSchoolDocuments(clubId: string) {
  return prisma.flightSchoolDocument.findMany({
    where: { clubId },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getAdminFlightSchoolDocumentById(clubId: string, id: string) {
  return prisma.flightSchoolDocument.findFirst({
    where: { id, clubId },
  });
}
