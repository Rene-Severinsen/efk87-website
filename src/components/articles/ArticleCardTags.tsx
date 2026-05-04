import Link from "next/link";
import React from "react";

interface Tag {
  slug: string;
  name: string;
}

interface ArticleCardTagsProps {
  tags: Tag[];
  getFilterUrl: (params: Record<string, string | null>) => string;
}

export default function ArticleCardTags({
                                          tags,
                                          getFilterUrl,
                                        }: ArticleCardTagsProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
            <Link
                key={tag.slug}
                href={getFilterUrl({ tag: tag.slug })}
                className="inline-flex min-h-[30px] items-center rounded-full border border-[var(--public-card-border)] bg-[var(--public-primary-soft)] px-3 py-1 text-xs font-bold leading-none text-[var(--public-primary)] no-underline transition hover:border-[var(--public-primary)] hover:bg-[var(--public-card)]"
            >
              {tag.name}
            </Link>
        ))}
      </div>
  );
}