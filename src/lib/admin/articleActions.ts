"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireClubBySlug } from "../tenancy/tenantService";
import { requireClubAdminForClub } from "../auth/adminAccessGuards";
import prisma from "../db/prisma";
import { ArticleStatus, PublicSurfaceVisibility } from "../../generated/prisma";
import { createUniqueArticleSlug } from "../articles/articleSlug";
import sanitizeHtml from "sanitize-html";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "h2", "h3", "h4", "strong", "em", "ul", "ol", "li", "blockquote", "a", "img"
  ],
  allowedAttributes: {
    "a": ["href", "target", "rel"],
    "img": ["src", "alt", "title"]
  },
  transformTags: {
    "a": (tagName, attribs) => {
      return {
        tagName: "a",
        attribs: {
          ...attribs,
          rel: "noopener noreferrer",
          target: "_blank"
        }
      };
    }
  }
};

export async function createArticleAction(clubSlug: string, formData: FormData) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug);

  const title = formData.get("title") as string;
  const excerpt = formData.get("excerpt") as string;
  const rawBody = formData.get("body") as string;
  const heroImageUrl = formData.get("heroImageUrl") as string;
  const authorName = formData.get("authorName") as string;
  const categoryId = formData.get("categoryId") as string;
  const status = formData.get("status") as ArticleStatus;
  const visibility = formData.get("visibility") as PublicSurfaceVisibility;
  const isFeatured = formData.get("isFeatured") === "true";
  const tagIds = formData.getAll("tagIds") as string[];

  // Validation
  if (!title || !rawBody) {
    throw new Error("Titel og indhold er påkrævet");
  }

  const body = sanitizeHtml(rawBody, SANITIZE_OPTIONS);
  const slug = await createUniqueArticleSlug(club.id, title);

  const publishedAt = status === ArticleStatus.PUBLISHED ? new Date() : null;

  await prisma.article.create({
    data: {
      clubId: club.id,
      title,
      slug,
      excerpt,
      body,
      heroImageUrl: heroImageUrl || null,
      authorName,
      categoryId: categoryId || null,
      status,
      visibility,
      isFeatured,
      publishedAt,
      tags: {
        create: tagIds.map((tagId) => ({
          tag: { connect: { id: tagId } },
        })),
      },
    },
  });

  revalidatePath(`/${clubSlug}/admin/artikler`);
  revalidatePath(`/${clubSlug}/artikler`);
  redirect(`/${clubSlug}/admin/artikler`);
}

export async function updateArticleAction(clubSlug: string, articleId: string, formData: FormData) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug);

  const title = formData.get("title") as string;
  const excerpt = formData.get("excerpt") as string;
  const rawBody = formData.get("body") as string;
  const heroImageUrl = formData.get("heroImageUrl") as string;
  const authorName = formData.get("authorName") as string;
  const categoryId = formData.get("categoryId") as string;
  const status = formData.get("status") as ArticleStatus;
  const visibility = formData.get("visibility") as PublicSurfaceVisibility;
  const isFeatured = formData.get("isFeatured") === "true";
  const tagIds = formData.getAll("tagIds") as string[];

  // Validation
  if (!title || !rawBody) {
    throw new Error("Titel og indhold er påkrævet");
  }

  const body = sanitizeHtml(rawBody, SANITIZE_OPTIONS);

  const currentArticle = await prisma.article.findUnique({
    where: { id: articleId, clubId: club.id },
    select: { status: true, publishedAt: true, slug: true },
  });

  if (!currentArticle) {
    throw new Error("Artiklen blev ikke fundet");
  }

  // Slug generation logic:
  // if article is DRAFT, regenerate slug from title.
  // if article is PUBLISHED, keep existing slug unless no slug exists.
  let slug = currentArticle.slug;
  if (status === ArticleStatus.DRAFT) {
    slug = await createUniqueArticleSlug(club.id, title, articleId);
  } else if (!slug) {
    slug = await createUniqueArticleSlug(club.id, title, articleId);
  }

  let publishedAt = currentArticle.publishedAt;
  if (status === ArticleStatus.PUBLISHED && !publishedAt) {
    publishedAt = new Date();
  }

  await prisma.$transaction(async (tx) => {
    // Update article
    await tx.article.update({
      where: { id: articleId, clubId: club.id },
      data: {
        title,
        slug,
        excerpt,
        body,
        heroImageUrl: heroImageUrl || null,
        authorName,
        categoryId: categoryId || null,
        status,
        visibility,
        isFeatured,
        publishedAt,
      },
    });

    // Update tags
    await tx.articleTagAssignment.deleteMany({
      where: { articleId },
    });

    if (tagIds.length > 0) {
      await tx.articleTagAssignment.createMany({
        data: tagIds.map((tagId) => ({
          articleId,
          tagId,
        })),
      });
    }
  });

  revalidatePath(`/${clubSlug}/admin/artikler`);
  revalidatePath(`/${clubSlug}/artikler`);
  revalidatePath(`/${clubSlug}/artikler/${slug}`);
  redirect(`/${clubSlug}/admin/artikler`);
}
