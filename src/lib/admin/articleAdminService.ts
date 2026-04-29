import prisma from "../db/prisma";

export async function getAdminArticleOverview(clubId: string) {
  const articles = await prisma.article.findMany({
    where: {
      clubId,
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
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

export async function getAdminArticleFormOptions(clubId: string) {
  const tags = await prisma.articleTag.findMany({
    where: { clubId },
    orderBy: { name: "asc" },
  });

  return {
    tags,
  };
}
