import {
  ArticleStatus,
  ClubFlightIntentStatus,
  ClubMemberStatus,
  FlightSchoolBookingStatus,
  FlightSchoolSessionStatus,
  GalleryAlbumStatus,
  HomepageContentSignupMode,
} from "../../generated/prisma";
import prisma from "../db/prisma";

export interface AdminDashboardOverview {
  kpis: {
    activeMembers: number;
    forumThreads: number;
    publishedArticles: number;
    publishedGalleryAlbums: number;
  };
  today: {
    flightIntents: number;
    flightSchoolSessions: number;
    flightSchoolBookings: number;
    homepageSignups: number;
  };
  content: {
    activeHomepageBoxes: number;
    signupEnabledHomepageBoxes: number;
    forumCategories: number;
    publicHomepageGalleryAlbums: number;
  };
  latestForumActivity: {
    id: string;
    title: string;
    categorySlug: string;
    categoryTitle: string;
    authorName: string | null;
    replyCount: number;
    lastActivityAt: Date;
    isPinned: boolean;
    isLocked: boolean;
  }[];
  latestHomepageSignups: {
    id: string;
    contentTitle: string;
    userName: string | null;
    quantity: number;
    createdAt: Date;
  }[];
}

function getTodayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

function getUserDisplayName(user: {
  name: string | null;
  email: string;
  memberProfiles: {
    firstName: string | null;
    lastName: string | null;
  }[];
}): string {
  const profile = user.memberProfiles[0];
  const profileName = [profile?.firstName, profile?.lastName]
    .filter(Boolean)
    .join(" ");

  return profileName || user.name || user.email;
}

export async function getAdminDashboardOverview(
  clubId: string,
): Promise<AdminDashboardOverview> {
  const { start, end } = getTodayRange();
  const now = new Date();

  const [
    activeMembers,
    forumThreads,
    publishedArticles,
    publishedGalleryAlbums,
    todayFlightIntents,
    todayFlightSchoolSessions,
    todayFlightSchoolBookings,
    todayHomepageSignups,
    activeHomepageBoxes,
    signupEnabledHomepageBoxes,
    forumCategories,
    publicHomepageGalleryAlbums,
    latestForumActivity,
    latestHomepageSignups,
  ] = await Promise.all([
    prisma.clubMemberProfile.count({
      where: {
        clubId,
        memberStatus: ClubMemberStatus.ACTIVE,
      },
    }),

    prisma.clubForumThread.count({
      where: {
        clubId,
      },
    }),

    prisma.article.count({
      where: {
        clubId,
        status: ArticleStatus.PUBLISHED,
      },
    }),

    prisma.galleryAlbum.count({
      where: {
        clubId,
        status: GalleryAlbumStatus.PUBLISHED,
      },
    }),

    prisma.clubFlightIntent.count({
      where: {
        clubId,
        status: ClubFlightIntentStatus.ACTIVE,
        flightDate: {
          gte: start,
          lt: end,
        },
      },
    }),

    prisma.flightSchoolSession.count({
      where: {
        clubId,
        date: {
          gte: start,
          lt: end,
        },
        status: {
          not: FlightSchoolSessionStatus.CANCELLED,
        },
      },
    }),

    prisma.flightSchoolBooking.count({
      where: {
        clubId,
        status: FlightSchoolBookingStatus.BOOKED,
        timeSlot: {
          startsAt: {
            gte: start,
            lt: end,
          },
        },
      },
    }),

    prisma.homepageContentSignup.count({
      where: {
        clubId,
        cancelledAt: null,
        createdAt: {
          gte: start,
          lt: end,
        },
      },
    }),

    prisma.homepageContent.count({
      where: {
        clubId,
        isActive: true,
        OR: [
          { visibleUntil: null },
          { visibleUntil: { gte: now } },
        ],
      },
    }),

    prisma.homepageContent.count({
      where: {
        clubId,
        isActive: true,
        signupMode: {
          not: HomepageContentSignupMode.NONE,
        },
        OR: [
          { visibleUntil: null },
          { visibleUntil: { gte: now } },
        ],
      },
    }),

    prisma.clubForumCategory.count({
      where: {
        clubId,
        isActive: true,
      },
    }),

    prisma.galleryAlbum.count({
      where: {
        clubId,
        status: GalleryAlbumStatus.PUBLISHED,
        showOnPublicHomepage: true,
      },
    }),

    prisma.clubForumThread.findMany({
      where: {
        clubId,
      },
      orderBy: {
        lastActivityAt: "desc",
      },
      take: 6,
      select: {
        id: true,
        title: true,
        replyCount: true,
        lastActivityAt: true,
        isPinned: true,
        isLocked: true,
        category: {
          select: {
            slug: true,
            title: true,
          },
        },
        author: {
          select: {
            name: true,
            email: true,
            memberProfiles: {
              where: {
                clubId,
              },
              select: {
                firstName: true,
                lastName: true,
              },
              take: 1,
            },
          },
        },
      },
    }),

    prisma.homepageContentSignup.findMany({
      where: {
        clubId,
        cancelledAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        quantity: true,
        createdAt: true,
        content: {
          select: {
            title: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            memberProfiles: {
              where: {
                clubId,
              },
              select: {
                firstName: true,
                lastName: true,
              },
              take: 1,
            },
          },
        },
      },
    }),
  ]);

  return {
    kpis: {
      activeMembers,
      forumThreads,
      publishedArticles,
      publishedGalleryAlbums,
    },
    today: {
      flightIntents: todayFlightIntents,
      flightSchoolSessions: todayFlightSchoolSessions,
      flightSchoolBookings: todayFlightSchoolBookings,
      homepageSignups: todayHomepageSignups,
    },
    content: {
      activeHomepageBoxes,
      signupEnabledHomepageBoxes,
      forumCategories,
      publicHomepageGalleryAlbums,
    },
    latestForumActivity: latestForumActivity.map((thread) => ({
      id: thread.id,
      title: thread.title,
      categorySlug: thread.category.slug,
      categoryTitle: thread.category.title,
      authorName: getUserDisplayName(thread.author),
      replyCount: thread.replyCount,
      lastActivityAt: thread.lastActivityAt,
      isPinned: thread.isPinned,
      isLocked: thread.isLocked,
    })),
    latestHomepageSignups: latestHomepageSignups.map((signup) => ({
      id: signup.id,
      contentTitle: signup.content.title,
      userName: getUserDisplayName(signup.user),
      quantity: signup.quantity,
      createdAt: signup.createdAt,
    })),
  };
}
