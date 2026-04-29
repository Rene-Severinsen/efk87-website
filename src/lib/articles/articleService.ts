import prisma from "../db/prisma";
import { ArticleStatus, PublicSurfaceVisibility, Article, ArticleCategory, ArticleTag, ArticleTagAssignment } from "../../generated/prisma";
import { ViewerVisibilityContext } from "../publicSite/publicVisibility";

export interface ArticleDTO {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  heroImageUrl: string | null;
  authorName: string | null;
  readingMinutes: number | null;
  publishedAt: Date | null;
  categoryName: string | null;
  categorySlug: string | null;
  tags: { name: string; slug: string }[];
}

export interface ArticleDetailDTO extends ArticleDTO {
  body: string;
}

type ArticleWithRelations = Article & {
  category: ArticleCategory | null;
  tags: (ArticleTagAssignment & {
    tag: ArticleTag;
  })[];
};

export async function getPublishedArticles(
  clubId: string,
  viewer: ViewerVisibilityContext,
  options?: { categorySlug?: string; tagSlug?: string; limit?: number }
): Promise<ArticleDTO[]> {
  const { categorySlug, tagSlug, limit } = options || {};

  const articles = await prisma.article.findMany({
    where: {
      clubId,
      status: ArticleStatus.PUBLISHED,
      visibility: viewer.isMember ? { in: [PublicSurfaceVisibility.PUBLIC, PublicSurfaceVisibility.MEMBERS_ONLY] } : PublicSurfaceVisibility.PUBLIC,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(tagSlug ? { tags: { some: { tag: { slug: tagSlug } } } } : {}),
    },
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: limit,
  });

  return articles.map(mapToArticleDTO);
}

export async function getFeaturedArticle(
  clubId: string,
  viewer: ViewerVisibilityContext
): Promise<ArticleDTO | null> {
  const article = await prisma.article.findFirst({
    where: {
      clubId,
      isFeatured: true,
      status: ArticleStatus.PUBLISHED,
      visibility: viewer.isMember ? { in: [PublicSurfaceVisibility.PUBLIC, PublicSurfaceVisibility.MEMBERS_ONLY] } : PublicSurfaceVisibility.PUBLIC,
    },
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
  });

  return article ? mapToArticleDTO(article) : null;
}

export async function getPublishedArticleBySlug(
  clubId: string,
  slug: string,
  viewer: ViewerVisibilityContext
): Promise<ArticleDetailDTO | null> {
  const article = await prisma.article.findFirst({
    where: {
      clubId,
      slug,
      status: ArticleStatus.PUBLISHED,
      visibility: viewer.isMember ? { in: [PublicSurfaceVisibility.PUBLIC, PublicSurfaceVisibility.MEMBERS_ONLY] } : PublicSurfaceVisibility.PUBLIC,
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

  if (!article) return null;

  return {
    ...mapToArticleDTO(article),
    body: article.body,
  };
}

export async function getArticleCategories(clubId: string) {
  return prisma.articleCategory.findMany({
    where: {
      clubId,
      isActive: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
}

export async function getArticleTags(clubId: string) {
  return prisma.articleTag.findMany({
    where: {
      clubId,
    },
    orderBy: {
      name: "asc",
    },
  });
}

function mapToArticleDTO(article: ArticleWithRelations): ArticleDTO {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    heroImageUrl: article.heroImageUrl,
    authorName: article.authorName,
    readingMinutes: article.readingMinutes,
    publishedAt: article.publishedAt,
    categoryName: article.category?.name || null,
    categorySlug: article.category?.slug || null,
    tags: article.tags?.map((t) => ({ name: t.tag.name, slug: t.tag.slug })) || [],
  };
}
