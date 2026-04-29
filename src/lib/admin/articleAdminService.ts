import prisma from "../db/prisma";

export async function getAdminArticleOverview(clubId: string) {
  const articles = await prisma.article.findMany({
    where: {
      clubId,
    },
    include: {
      category: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const kpis = {
    published: articles.filter((a) => a.status === "PUBLISHED").length,
    drafts: articles.filter((a) => a.status === "DRAFT").length,
    featured: articles.filter((a) => a.isFeatured).length,
    archived: articles.filter((a) => a.status === "ARCHIVED").length,
  };

  return {
    articles,
    kpis,
  };
}

export async function getAdminArticleById(clubId: string, articleId: string) {
  return prisma.article.findFirst({
    where: {
      id: articleId,
      clubId,
    },
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

export async function getAdminArticleFormOptions(clubId: string) {
  const [categories, tags] = await Promise.all([
    prisma.articleCategory.findMany({
      where: { clubId, isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.articleTag.findMany({
      where: { clubId },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    categories,
    tags,
  };
}
