import prisma from "../db/prisma";
import { HomepageContentVisibility, HomepageContent, HomepageContentSignup } from "../../generated/prisma";
import { ViewerVisibilityContext } from "../publicSite/publicVisibility";

export type HomepageContentWithSignups = HomepageContent & {
  signups: HomepageContentSignup[];
  _count: {
    signups: number;
  }
};

export async function getActiveHomepageContentForClub(
  clubId: string,
  viewer: ViewerVisibilityContext
): Promise<HomepageContentWithSignups[]> {
  const now = new Date();

  const visibilityFilter = viewer.isAuthenticated && (viewer.isMember || viewer.isAdmin)
    ? [HomepageContentVisibility.PUBLIC, HomepageContentVisibility.MEMBERS_ONLY]
    : [HomepageContentVisibility.PUBLIC];

  // We want to filter by date range in a robust way
  // show if now >= visibleFrom, when visibleFrom is set
  // show if now <= visibleUntil, when visibleUntil is set
  // if dates are empty, rely on isActive only
  
  const content = await prisma.homepageContent.findMany({
    where: {
      clubId,
      isActive: true,
      visibility: { in: visibilityFilter },
      AND: [
        {
          OR: [
            { visibleFrom: null },
            { visibleFrom: { lte: now } }
          ]
        },
        {
          OR: [
            { visibleUntil: null },
            { visibleUntil: { gte: now } }
          ]
        }
      ]
    },
    include: {
      signups: {
        where: {
          cancelledAt: null
        }
      },
      _count: {
        select: {
          signups: {
            where: {
              cancelledAt: null
            }
          }
        }
      }
    },
    orderBy: [
      { sortOrder: 'asc' },
      { visibleFrom: { sort: 'desc', nulls: 'last' } },
      { createdAt: 'desc' }
    ]
  });

  return content as HomepageContentWithSignups[];
}

export async function getHomepageContentById(id: string, clubId: string) {
  return prisma.homepageContent.findFirst({
    where: { id, clubId },
    include: {
      signups: {
        where: { cancelledAt: null },
        include: {
          user: true
        }
      },
      _count: {
        select: {
          signups: {
            where: { cancelledAt: null }
          }
        }
      }
    }
  });
}

export async function getAllHomepageContentForAdmin(clubId: string) {
  return prisma.homepageContent.findMany({
    where: { clubId },
    include: {
      _count: {
        select: {
          signups: {
            where: { cancelledAt: null }
          }
        }
      }
    },
    orderBy: [
      { sortOrder: 'asc' },
      { createdAt: 'desc' }
    ]
  });
}

export async function getSignupsForContent(contentId: string, clubId: string) {
  return prisma.homepageContentSignup.findMany({
    where: { 
      contentId,
      content: { clubId }
    },
    include: {
      user: {
        include: {
          memberProfiles: {
            where: { clubId }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}
