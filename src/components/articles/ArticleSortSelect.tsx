"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { publicRoutes } from "../../lib/publicRoutes";

interface ArticleSortSelectProps {
  currentSort: string;
  clubSlug: string;
}

export default function ArticleSortSelect({
                                            currentSort,
                                            clubSlug,
                                          }: ArticleSortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    const queryString = params.toString();
    router.push(
        queryString
            ? `${publicRoutes.articles(clubSlug)}?${queryString}`
            : publicRoutes.articles(clubSlug)
    );
  };

  return (
      <select
          defaultValue={currentSort}
          onChange={handleChange}
          className="public-input cursor-pointer appearance-none pr-12"
      >
        <option value="newest">Nyeste først</option>
        <option value="oldest">Ældste først</option>
        <option value="title">Titel (A-Å)</option>
      </select>
  );
}