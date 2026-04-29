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
      style={{ 
        width: '100%',
        appearance: 'none',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        gap: '12px', 
        padding: '12px 14px', 
        borderRadius: '14px', 
        background: 'var(--club-panel-soft)', 
        border: '1px solid var(--club-line)', 
        color: '#dbe7ff', 
        fontSize: '15px',
        outline: 'none',
        cursor: 'pointer'
      }}
    >
      <option value="newest">Nyeste først</option>
      <option value="oldest">Ældste først</option>
      <option value="title">Titel (A-Å)</option>
    </select>
  );
}
