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

export default function ArticleTagCloud({ tags, selectedTagSlug, getFilterUrl }: ArticleTagCloudProps) {
  const maxCount = Math.max(...tags.map(t => t.articleCount), 1);
  
  const getTagTierClasses = (count: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.75) return 'px-3 sm:px-4 py-1.5 sm:py-2.5 text-base sm:text-lg'; // tier-4
    if (ratio > 0.4) return 'px-2.5 sm:px-3.5 py-1 sm:py-2 text-sm sm:text-base'; // tier-3
    if (ratio > 0.15) return 'px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm'; // tier-2
    return 'px-2 sm:px-2.5 py-1 sm:py-1.5 text-[10px] sm:text-xs'; // tier-1
  };

  const baseChipClasses = "inline-flex items-center rounded-full border border-sky-300/25 bg-sky-300/10 text-sky-50 font-bold no-underline whitespace-nowrap transition hover:bg-sky-300/20 hover:border-sky-300/40";
  const activeClasses = "bg-sky-300/25 border-sky-300/50 text-white";

  return (
    <div className="article-tag-cloud flex flex-wrap items-center gap-2">
      <Link
        href={getFilterUrl({ tag: null })}
        className={`${baseChipClasses} px-2.5 py-1.5 text-xs ${!selectedTagSlug ? activeClasses : ''}`}
      >
        Alle emner
      </Link>
      {tags.filter(t => t.articleCount > 0).map(tag => {
        const tierClasses = getTagTierClasses(tag.articleCount);
        const isActive = selectedTagSlug === tag.slug;
        
        return (
          <Link
            key={tag.id}
            href={getFilterUrl({ tag: tag.slug })}
            className={`${baseChipClasses} ${tierClasses} ${isActive ? activeClasses : ''}`}
          >
            {tag.name}
          </Link>
        );
      })}
    </div>
  );
}
