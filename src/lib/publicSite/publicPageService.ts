import prisma from "../db/prisma";
import { PublicPageStatus } from "../../generated/prisma";

/**
 * Service for fetching public CMS content.
 */
export async function getPublishedPublicPage(clubId: string, slug: string) {
  return prisma.publicPage.findUnique({
    where: {
      clubId_slug: {
        clubId,
        slug,
      },
      status: PublicPageStatus.PUBLISHED,
    },
  });
}

/**
 * Fetches the homepage content for a club.
 * Wraps getPublishedPublicPage with the 'home' slug.
 */
export async function getPublicHomePage(clubId: string) {
  return getPublishedPublicPage(clubId, 'home');
}
