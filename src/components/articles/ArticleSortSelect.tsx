'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ArticleSortSelectProps {
  currentSort: string;
  clubSlug: string;
}

export default function ArticleSortSelect({ currentSort, clubSlug }: ArticleSortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    
    if (val === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', val);
    }
    
    router.push(`/${clubSlug}/artikler?${params.toString()}`);
  };

  return (
    <select 
      defaultValue={currentSort}
      onChange={handleChange}
      className="w-full appearance-none flex items-center justify-between gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-[14px] bg-[var(--club-panel-soft)] border border-[var(--club-line)] text-[#dbe7ff] text-sm sm:text-[15px] outline-none cursor-pointer"
    >
      <option value="newest">Nyeste først</option>
      <option value="oldest">Ældste først</option>
      <option value="title">Titel (A-Å)</option>
    </select>
  );
}
