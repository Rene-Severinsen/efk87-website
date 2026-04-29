import prisma from "../db/prisma";

export async function getForumCategories(clubId: string, onlyActive = true) {
  return prisma.clubForumCategory.findMany({
    where: {
      clubId,
      ...(onlyActive ? { isActive: true } : {}),
    },
    orderBy: {
      sortOrder: "asc",
    },
    include: {
      _count: {
        select: {
          threads: true,
        },
      },
    },
  });
}

export async function getForumCategoryBySlug(clubId: string, slug: string) {
  return prisma.clubForumCategory.findFirst({
    where: {
      clubId,
      slug,
    },
  });
}

export async function getForumThreads(
  clubId: string,
  categoryId: string,
  options?: { limit?: number; offset?: number }
) {
  return prisma.clubForumThread.findMany({
    where: {
      clubId,
      categoryId,
    },
    orderBy: [{ isPinned: "desc" }, { lastActivityAt: "desc" }],
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          memberProfiles: {
            where: { clubId },
            select: { firstName: true, lastName: true },
          },
        },
      },
    },
    take: options?.limit,
    skip: options?.offset,
  });
}

export async function getForumThreadBySlug(clubId: string, categoryId: string, slug: string) {
  return prisma.clubForumThread.findFirst({
    where: {
      clubId,
      categoryId,
      slug,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          memberProfiles: {
            where: { clubId },
            select: { firstName: true, lastName: true },
          },
        },
      },
      category: true,
    },
  });
}

export async function getForumReplies(threadId: string) {
  return prisma.clubForumReply.findMany({
    where: {
      threadId,
      isDeleted: false,
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          memberProfiles: {
            where: {
              // We don't have clubId here easily unless we join through thread.
              // But replies are scoped to thread which is scoped to club.
              // For simplicity in DTO mapping we might need clubId.
            },
            select: { firstName: true, lastName: true },
          },
        },
      },
    },
  });
}

export async function getLatestForumActivity(clubId: string, limit = 5) {
  return prisma.clubForumThread.findMany({
    where: {
      clubId,
    },
    orderBy: {
      lastActivityAt: "desc",
    },
    take: limit,
    include: {
      category: true,
      author: {
        select: {
          id: true,
          name: true,
          memberProfiles: {
            where: { clubId },
            select: { firstName: true, lastName: true },
          },
        },
      },
      replies: {
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              memberProfiles: {
                where: { clubId },
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      },
    },
  });
}
