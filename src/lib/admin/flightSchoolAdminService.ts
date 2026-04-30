import prisma from "../db/prisma";
import { normalizeSlug } from "../slug/normalizeSlug";

export async function getAdminFlightSchoolPage(clubId: string) {
  return prisma.flightSchoolPage.findUnique({
    where: { clubId },
  });
}

export async function upsertFlightSchoolPage(
  clubId: string,
  data: {
    title: string;
    intro: string;
    contentHtml: string;
    isPublished: boolean;
  }
) {
  return prisma.flightSchoolPage.upsert({
    where: { clubId },
    update: data,
    create: {
      ...data,
      clubId,
    },
  });
}

export async function getAdminFlightSchoolDocuments(clubId: string) {
  return prisma.flightSchoolDocument.findMany({
    where: { clubId },
    orderBy: [
      { sortOrder: "asc" },
      { title: "asc" }
    ],
  });
}

export async function getAdminFlightSchoolDocumentById(clubId: string, id: string) {
  return prisma.flightSchoolDocument.findFirst({
    where: { id, clubId },
  });
}

export async function createFlightSchoolDocument(
  clubId: string,
  data: {
    title: string;
    slug: string;
    excerpt?: string | null;
    contentHtml: string;
    sortOrder: number;
    isPublished: boolean;
  }
) {
  const normalizedSlug = normalizeSlug(data.slug);
  
  // Check for duplicate slug
  const existing = await prisma.flightSchoolDocument.findFirst({
    where: {
      clubId,
      slug: normalizedSlug,
    },
  });

  if (existing) {
    throw new Error(`En dokument med slug "${normalizedSlug}" findes allerede.`);
  }

  return prisma.flightSchoolDocument.create({
    data: {
      ...data,
      slug: normalizedSlug,
      clubId,
    },
  });
}

export async function updateFlightSchoolDocument(
  clubId: string,
  id: string,
  data: {
    title: string;
    slug: string;
    excerpt?: string | null;
    contentHtml: string;
    sortOrder: number;
    isPublished: boolean;
  }
) {
  const normalizedSlug = normalizeSlug(data.slug);

  // Check for duplicate slug
  const existing = await prisma.flightSchoolDocument.findFirst({
    where: {
      clubId,
      slug: normalizedSlug,
      NOT: { id },
    },
  });

  if (existing) {
    throw new Error(`En dokument med slug "${normalizedSlug}" findes allerede.`);
  }

  return prisma.flightSchoolDocument.update({
    where: { id, clubId },
    data: {
      ...data,
      slug: normalizedSlug,
    },
  });
}

export async function deleteFlightSchoolDocument(clubId: string, id: string) {
  return prisma.flightSchoolDocument.delete({
    where: { id, clubId },
  });
}

export async function getFlightSchoolInstructors(clubId: string) {
  return prisma.clubMemberProfile.findMany({
    where: {
      clubId,
      isInstructor: true,
      memberStatus: "ACTIVE", // Only active instructors
    },
    orderBy: [
      { firstName: "asc" },
      { lastName: "asc" }
    ],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profileImageUrl: true,
    }
  });
}

export async function getAdminFlightSchoolSessions(clubId: string) {
  return prisma.flightSchoolSession.findMany({
    where: { clubId },
    include: {
      instructor: true,
      timeSlots: {
        include: {
          bookings: {
            include: {
              member: true,
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
      _count: {
        select: { timeSlots: true, }
      }
    },
    orderBy: [
      { date: "asc" },
      { startsAt: "asc" },
    ],
  });
}

export async function getAdminFlightSchoolSessionById(clubId: string, id: string) {
  return prisma.flightSchoolSession.findFirst({
    where: { id, clubId },
    include: {
      instructor: true,
      timeSlots: {
        include: {
          bookings: {
            include: {
              member: true,
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}
