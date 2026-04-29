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

export default function ArticleCardTags({ tags, getFilterUrl }: ArticleCardTagsProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="article-card-tag-row flex flex-wrap items-center gap-2">
      {tags.map(tag => (
        <Link 
          key={tag.slug} 
          href={getFilterUrl({ tag: tag.slug })} 
          className="article-card-tag inline-flex items-center rounded-full border border-sky-300/20 bg-sky-300/10 px-2.5 py-1 text-xs font-bold leading-none text-sky-50 no-underline whitespace-nowrap transition hover:bg-sky-300/20 hover:border-sky-300/35"
        >
          {tag.name}
        </Link>
      ))}
    </div>
  );
}
