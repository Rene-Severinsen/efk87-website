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
  <div className={`admin-card relative overflow-hidden ${className}`}>
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

  const inputClasses = "admin-input";
  const labelClasses = "admin-form-label";

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

          <div>
            <label className={labelClasses}>Notifikationsmail</label>
            <input
              name="notificationEmail"
              type="email"
              defaultValue={initialData?.notificationEmail || ""}
              placeholder="fx bestyrelse@efk87.dk"
              className={inputClasses}
            />
            <p className="admin-form-help mt-2 italic">
              Hvis feltet er udfyldt, sendes der mail ved nye tråde og svar i denne kategori.
            </p>
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
                  <div className="admin-toggle-track"></div>
                  <div className="admin-toggle-dot"></div>
                </div>
                <span className="ml-3 admin-strong font-medium">Aktiv</span>
              </label>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="flex items-center justify-end gap-4">
        <Link
          href={`/${clubSlug}/admin/forum`}
          className="admin-btn"
        >
          Annuller
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="admin-btn admin-btn-primary"
        >
          {isPending ? "Gemmer..." : initialData ? "Opdater kategori" : "Opret kategori"}
        </button>
      </div>
    </form>
  );
}
