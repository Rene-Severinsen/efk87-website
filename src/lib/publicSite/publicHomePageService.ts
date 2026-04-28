import prisma from "../db/prisma";
import { PublicPageStatus } from "../../generated/prisma";

/**
 * Fetches the homepage content for a club.
 * This is structurally separate from generic public pages.
 * 
 * @param clubId The unique identifier of the club
 * @returns The PublicHomePage record or null if not found
 */
export async function getPublicHomePage(clubId: string) {
  return prisma.publicPage.findUnique({
    where: {
      clubId_slug: {
        clubId,
        slug: 'home',
      },
      status: PublicPageStatus.PUBLISHED,
    },
  });
}
