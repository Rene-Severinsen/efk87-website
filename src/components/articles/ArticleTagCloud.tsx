import Link from "next/link";
import React from "react";

interface Tag {
  id: string;
  slug: string;
  name: string;
  articleCount: number;
}

interface ArticleTagCloudProps {
  tags: Tag[];
  selectedTagSlug?: string;
  getFilterUrl: (params: Record<string, string | null>) => string;
}

export default function ArticleTagCloud({
                                          tags,
                                          selectedTagSlug,
                                          getFilterUrl,
                                        }: ArticleTagCloudProps) {
  const maxCount = Math.max(...tags.map((tag) => tag.articleCount), 1);

  const getTagTierClasses = (count: number) => {
    const ratio = count / maxCount;

    if (ratio > 0.75) {
      return "px-4 py-2 text-sm";
    }

    if (ratio > 0.4) {
      return "px-3.5 py-2 text-sm";
    }

    if (ratio > 0.15) {
      return "px-3 py-1.5 text-xs";
    }

    return "px-2.5 py-1.5 text-xs";
  };

  const getChipClasses = (isActive: boolean, tierClasses: string) =>
      [
        "inline-flex min-h-[32px] items-center rounded-full border font-bold no-underline transition",
        "whitespace-nowrap",
        tierClasses,
        isActive
            ? "border-[var(--public-primary)] bg-[var(--public-primary)] text-[var(--public-text-on-primary)]"
            : "border-[var(--public-card-border)] bg-[var(--public-primary-soft)] text-[var(--public-primary)] hover:border-[var(--public-primary)] hover:bg-[var(--public-card)]",
      ].join(" ");

  return (
      <div className="flex flex-wrap items-center gap-2">
        <Link
            href={getFilterUrl({ tag: null })}
            className={getChipClasses(!selectedTagSlug, "px-3 py-1.5 text-xs")}
        >
          Alle emner
        </Link>

        {tags
            .filter((tag) => tag.articleCount > 0)
            .map((tag) => {
              const tierClasses = getTagTierClasses(tag.articleCount);
              const isActive = selectedTagSlug === tag.slug;

              return (
                  <Link
                      key={tag.id}
                      href={getFilterUrl({ tag: tag.slug })}
                      className={getChipClasses(isActive, tierClasses)}
                  >
                    {tag.name}
                  </Link>
              );
            })}
      </div>
  );
}