import prisma from "../db/prisma";
import { ArticleStatus, PublicSurfaceVisibility, Article, ArticleTag, ArticleTagAssignment } from "../../generated/prisma";
import { ViewerVisibilityContext } from "../publicSite/publicVisibility";

export interface ArticleDTO {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  heroImageUrl: string | null;
  authorName: string | null;
  publishedAt: Date | null;
  tags: { name: string; slug: string }[];
}

export interface ArticleDetailDTO extends ArticleDTO {
  body: string;
}

type ArticleWithRelations = Article & {
  tags: (ArticleTagAssignment & {
    tag: ArticleTag;
  })[];
};

export async function getPublishedArticles(
  clubId: string,
  viewer: ViewerVisibilityContext,
  options?: { tagSlug?: string; limit?: number }
): Promise<ArticleDTO[]> {
  const { tagSlug, limit } = options || {};

  const articles = await prisma.article.findMany({
    where: {
      clubId,
      status: ArticleStatus.PUBLISHED,
      visibility: viewer.isMember ? { in: [PublicSurfaceVisibility.PUBLIC, PublicSurfaceVisibility.MEMBERS_ONLY] } : PublicSurfaceVisibility.PUBLIC,
      ...(tagSlug ? { tags: { some: { tag: { slug: tagSlug } } } } : {}),
    },
    include: {
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

export async function getArticleTags(clubId: string, viewer: ViewerVisibilityContext) {
  const tags = await prisma.articleTag.findMany({
    where: {
      clubId,
    },
    include: {
      _count: {
        select: {
          articles: {
            where: {
              article: {
                status: ArticleStatus.PUBLISHED,
                visibility: viewer.isMember ? { in: [PublicSurfaceVisibility.PUBLIC, PublicSurfaceVisibility.MEMBERS_ONLY] } : PublicSurfaceVisibility.PUBLIC,
              }
            }
          }
        }
      }
    },
    orderBy: {
      name: "asc",
    },
  });

  return tags.map(tag => ({
    id: tag.id,
    slug: tag.slug,
    name: tag.name,
    articleCount: tag._count.articles,
  }));
}

function mapToArticleDTO(article: ArticleWithRelations): ArticleDTO {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    heroImageUrl: article.heroImageUrl,
    authorName: article.authorName,
    publishedAt: article.publishedAt,
    tags: article.tags?.map((t) => ({ name: t.tag.name, slug: t.tag.slug })) || [],
  };
}
