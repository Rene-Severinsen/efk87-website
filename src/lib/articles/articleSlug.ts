import prisma from "../db/prisma";

export function createSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function createUniqueArticleSlug(
  clubId: string,
  title: string,
  existingArticleId?: string
): Promise<string> {
  const baseSlug = createSlugFromTitle(title);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingArticle = await prisma.article.findFirst({
      where: {
        clubId,
        slug,
        NOT: existingArticleId ? { id: existingArticleId } : undefined,
      },
      select: { id: true },
    });

    if (!existingArticle) {
      break;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
}
