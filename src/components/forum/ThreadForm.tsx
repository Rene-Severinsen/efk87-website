"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import Link from 'next/link';

const ArticleRichTextEditor = dynamic(() => import('../admin/articles/ArticleRichTextEditor'), {
  ssr: false,
});

interface ThreadFormProps {
  clubSlug: string;
  categorySlug: string;
  categoryTitle: string;
  action: (formData: FormData) => Promise<void>;
}

export default function ThreadForm({ clubSlug, categorySlug, action }: ThreadFormProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [bodyHtml, setBodyHtml] = React.useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    formData.set("bodyHtml", bodyHtml);
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

  const inputClasses = "w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all text-lg";
  const labelClasses = "block text-sm font-bold text-slate-500 mb-2 ml-2 uppercase tracking-widest";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 mt-8">
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[2rem] p-8 shadow-2xl">
        <div className="space-y-8">
          <div>
            <label className={labelClasses}>Trådens titel</label>
            <input
              name="title"
              type="text"
              required
              placeholder="Hvad vil du gerne tale om?"
              className={inputClasses}
              autoFocus
            />
          </div>

          <div>
            <label className={labelClasses}>Indhold</label>
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
              <ArticleRichTextEditor 
                content={bodyHtml} 
                onChange={setBodyHtml} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-6">
        <Link
          href={`/${clubSlug}/forum/${categorySlug}`}
          className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
        >
          Annuller
        </Link>
        <button
          type="submit"
          disabled={isPending || !bodyHtml || bodyHtml === "<p></p>"}
          className="px-10 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-bold shadow-xl shadow-sky-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isPending ? "Opretter..." : "Opret tråd"}
        </button>
      </div>
    </form>
  );
}
