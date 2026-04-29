"use client";

import React from "react";
import dynamic from "next/dynamic";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { ArticleStatus, PublicSurfaceVisibility, ArticleTag, Article } from "../../../generated/prisma";
import Link from "next/link";

const ArticleRichTextEditor = dynamic(() => import("./ArticleRichTextEditor"), {
  ssr: false,
});

interface ArticleWithTags extends Article {
  tags?: { tagId: string }[];
}

interface ArticleFormProps {
  clubSlug: string;
  initialData?: ArticleWithTags;
  tags: ArticleTag[];
  action: (formData: FormData) => Promise<void>;
}

export default function ArticleForm({
  clubSlug,
  initialData,
  tags,
  action,
}: ArticleFormProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [bodyContent, setBodyContent] = React.useState(initialData?.body || "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    formData.set("body", bodyContent);
    try {
      await action(formData);
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }
      console.error(error);
      alert(error instanceof Error ? error.message : "Der skete en fejl");
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-article-form" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
      <div className="admin-article-form-main" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="admin-card" style={{ padding: '24px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>Titel</label>
            <input
              name="title"
              type="text"
              required
              defaultValue={initialData?.title}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>Uddrag (Excerpt)</label>
            <textarea
              name="excerpt"
              rows={3}
              defaultValue={initialData?.excerpt ?? undefined}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-y"
              placeholder="Giv en kort introduktion til artiklen..."
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>Indhold</label>
            <ArticleRichTextEditor
              content={bodyContent}
              onChange={setBodyContent}
            />
          </div>
        </div>
      </div>

      <div className="admin-article-form-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="admin-card" style={{ padding: '24px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>Status</label>
            <select
              name="status"
              defaultValue={initialData?.status || ArticleStatus.DRAFT}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
            >
              <option value={ArticleStatus.DRAFT}>Draft</option>
              <option value={ArticleStatus.PUBLISHED}>Published</option>
              <option value={ArticleStatus.ARCHIVED}>Archived</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>Synlighed</label>
            <select
              name="visibility"
              defaultValue={initialData?.visibility || PublicSurfaceVisibility.PUBLIC}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
            >
              <option value={PublicSurfaceVisibility.PUBLIC}>Public</option>
              <option value={PublicSurfaceVisibility.MEMBERS_ONLY}>Members Only</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: '600' }}>
              <input
                name="isFeatured"
                type="checkbox"
                value="true"
                defaultChecked={initialData?.isFeatured}
              />
              Fremhævet artikel
            </label>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '24px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>Tags</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '150px', overflowY: 'auto', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}>
              {tags.map(t => (
                <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                  <input
                    name="tagIds"
                    type="checkbox"
                    value={t.id}
                    defaultChecked={initialData?.tags?.some((at) => at.tagId === t.id)}
                  />
                  {t.name}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '24px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>Forfatter (Navn)</label>
            <input
              name="authorName"
              type="text"
              defaultValue={initialData?.authorName ?? undefined}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Forfatter er server-bestemt og kan ikke ændres her.</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>Hero Image URL (Valgfri)</label>
            <input
              name="heroImageUrl"
              type="text"
              defaultValue={initialData?.heroImageUrl ?? undefined}
              placeholder="https://eksempel.dk/billede.jpg"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
            />
            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>Dette billede vises øverst i artiklen.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            type="submit"
            disabled={isPending}
            className="admin-btn admin-btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            {isPending ? 'Gemmer...' : 'Gem artikel'}
          </button>
          <Link
            href={`/${clubSlug}/admin/artikler`}
            className="admin-btn"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            Tilbage til artikler
          </Link>
        </div>
      </div>
    </form>
  );
}
