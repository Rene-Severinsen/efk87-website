"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

const ArticleRichTextEditor = dynamic(() => import('../admin/articles/ArticleRichTextEditor'), {
  ssr: false,
});

interface ReplyFormProps {
  action: (formData: FormData) => Promise<void>;
}

export default function ReplyForm({ action }: ReplyFormProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [bodyHtml, setBodyHtml] = React.useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    formData.set("bodyHtml", bodyHtml);
    try {
      await action(formData);
      setBodyHtml("");
      setIsPending(false);
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }
      console.error(error);
      alert(error instanceof Error ? error.message : "Der skete en fejl");
      setIsPending(false);
    }
  }

  const labelClasses = "block text-sm font-bold text-slate-500 mb-4 ml-2 uppercase tracking-widest";

  return (
    <form onSubmit={handleSubmit} className="mt-12">
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[2rem] p-8 shadow-2xl">
        <label className={labelClasses}>Skriv et svar</label>
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 mb-6">
          <ArticleRichTextEditor 
            content={bodyHtml} 
            onChange={setBodyHtml} 
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending || !bodyHtml || bodyHtml === "<p></p>"}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-bold shadow-xl shadow-sky-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isPending ? "Sender..." : "Send svar"}
          </button>
        </div>
      </div>
    </form>
  );
}
