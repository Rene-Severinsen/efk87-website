import prisma from "../db/prisma";

export async function getAdminArticleTags(clubId: string) {
  return prisma.articleTag.findMany({
    where: { clubId },
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      updatedAt: true,
      _count: {
        select: {
          articles: true,
        },
      },
    },
  });
}
