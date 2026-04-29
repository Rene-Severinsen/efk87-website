"use client";

import React from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import Link from "next/link";
import { ClubForumCategory } from "../../../generated/prisma";

interface ForumCategoryFormProps {
  clubSlug: string;
  initialData?: ClubForumCategory;
  action: (formData: FormData) => Promise<void>;
}

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`backdrop-blur-md bg-[#121b2e]/80 border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden ${className}`}>
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500/50 to-emerald-500/50 opacity-30" />
    {children}
  </div>
);

export default function ForumCategoryForm({
  clubSlug,
  initialData,
  action,
}: ForumCategoryFormProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [title, setTitle] = React.useState(initialData?.title || "");
  const [slug, setSlug] = React.useState(initialData?.slug || "");

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[æ]/g, 'ae')
      .replace(/[ø]/g, 'oe')
      .replace(/[å]/g, 'aa')
      .replace(/[^a-z0-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!initialData) {
      setSlug(generateSlug(newTitle));
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
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

  const inputClasses = "w-full bg-slate-950/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all";
  const labelClasses = "block text-sm font-bold text-slate-400 mb-2 ml-1 uppercase tracking-wider";

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
      <GlassCard className="p-8">
        <div className="space-y-6">
          <div>
            <label className={labelClasses}>Titel *</label>
            <input
              name="title"
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="F.eks. Generelt"
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>Slug (URL) *</label>
            <input
              name="slug"
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="generelt"
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>Beskrivelse</label>
            <textarea
              name="description"
              defaultValue={initialData?.description || ""}
              placeholder="En kort beskrivelse af kategorien..."
              rows={3}
              className={inputClasses}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>Sorteringsrækkefølge</label>
              <input
                name="sortOrder"
                type="number"
                defaultValue={initialData?.sortOrder || 0}
                className={inputClasses}
              />
            </div>
            <div className="flex items-center pt-8">
              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    name="isActive"
                    type="checkbox"
                    defaultChecked={initialData ? initialData.isActive : true}
                    className="sr-only"
                  />
                  <div className="w-10 h-6 bg-slate-800 rounded-full shadow-inner transition-colors group-has-[:checked]:bg-emerald-500/50"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-slate-400 rounded-full transition-transform group-has-[:checked]:translate-x-4 group-has-[:checked]:bg-white"></div>
                </div>
                <span className="ml-3 text-slate-300 font-medium">Aktiv</span>
              </label>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="flex items-center justify-end gap-4">
        <Link
          href={`/${clubSlug}/admin/forum`}
          className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
        >
          Annuller
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-bold shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Gemmer..." : initialData ? "Opdater kategori" : "Opret kategori"}
        </button>
      </div>
    </form>
  );
}
