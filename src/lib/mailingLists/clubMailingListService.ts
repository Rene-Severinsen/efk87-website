import prisma from "@/lib/db/prisma";
import { ClubMailingListPurpose } from "@/generated/prisma";

export interface ClubMailingListDto {
  id: string;
  key: string;
  name: string;
  description: string | null;
  emailAddress: string;
  purpose: ClubMailingListPurpose;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Returns all active mailing lists for a specific club.
 */
export async function getActiveClubMailingLists(clubId: string): Promise<ClubMailingListDto[]> {
  const lists = await prisma.clubMailingList.findMany({
    where: {
      clubId,
      isActive: true,
    },
    select: {
      id: true,
      key: true,
      name: true,
      description: true,
      emailAddress: true,
      purpose: true,
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return lists;
}

/**
 * Returns all mailing lists for a specific club (admin view).
 */
export async function getAdminClubMailingLists(clubId: string): Promise<ClubMailingListDto[]> {
  const lists = await prisma.clubMailingList.findMany({
    where: {
      clubId,
    },
    select: {
      id: true,
      key: true,
      name: true,
      description: true,
      emailAddress: true,
      purpose: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [
      { purpose: "asc" },
      { name: "asc" },
    ],
  });

  return lists.map(list => ({
    ...list,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
  }));
}

/**
 * Returns a specific active mailing list for a club by its purpose.
 * Returns null if no active list exists for that purpose.
 */
export async function getClubMailingListByPurpose(
  clubId: string,
  purpose: ClubMailingListPurpose
): Promise<ClubMailingListDto | null> {
  const list = await prisma.clubMailingList.findFirst({
    where: {
      clubId,
      purpose,
      isActive: true,
    },
    select: {
      id: true,
      key: true,
      name: true,
      description: true,
      emailAddress: true,
      purpose: true,
      isActive: true,
    },
  });

  return list;
}

/**
 * Convenience helper to get the FLIGHT_INTENT mailing list for a club.
 */
export async function getFlightIntentMailingListForClub(clubId: string): Promise<ClubMailingListDto | null> {
  return getClubMailingListByPurpose(clubId, ClubMailingListPurpose.FLIGHT_INTENT);
}
