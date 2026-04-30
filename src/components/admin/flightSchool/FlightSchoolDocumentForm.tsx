"use client";

import React, { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { createFlightSchoolDocumentAction, updateFlightSchoolDocumentAction } from "../../../lib/admin/flightSchoolActions";
import { normalizeSlug } from "../../../lib/slug/normalizeSlug";
import { FlightSchoolDocument } from "../../../generated/prisma";

const ArticleRichTextEditor = dynamic(() => import("../articles/ArticleRichTextEditor"), {
  ssr: false,
  loading: () => <div className="h-64 bg-white/5 animate-pulse rounded-lg" />,
});

interface FlightSchoolDocumentFormProps {
  clubSlug: string;
  initialData?: FlightSchoolDocument | null;
  onSuccess?: () => void;
}

const FlightSchoolDocumentForm: React.FC<FlightSchoolDocumentFormProps> = ({
  clubSlug,
  initialData,
  onSuccess,
}) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [contentHtml, setContentHtml] = useState(initialData?.contentHtml || "");
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder || 0);
  const [isPublished, setIsPublished] = useState(initialData?.isPublished || false);

  const [isAutoSlug, setIsAutoSlug] = useState(!initialData);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (isAutoSlug) {
      setSlug(normalizeSlug(newTitle));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setIsAutoSlug(false);
  };

  const handleAutoSlugToggle = () => {
    const newAutoSlug = true;
    setIsAutoSlug(newAutoSlug);
    if (title) {
      setSlug(normalizeSlug(title));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("slug", normalizeSlug(slug));
    formData.append("excerpt", excerpt);
    formData.append("contentHtml", contentHtml);
    formData.append("sortOrder", String(sortOrder));
    formData.append("isPublished", String(isPublished));

    startTransition(async () => {
      try {
        if (initialData) {
          await updateFlightSchoolDocumentAction(clubSlug, initialData.id, formData);
        } else {
          await createFlightSchoolDocumentAction(clubSlug, formData);
        }
        if (onSuccess) onSuccess();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Der skete en fejl");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="admin-card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="admin-form-label">Titel</label>
              <input
                type="text"
                className="admin-input"
                value={title}
                onChange={handleTitleChange}
                required
              />
            </div>

            <div>
              <label className="admin-form-label">Slug</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="admin-input"
                  value={slug}
                  onChange={handleSlugChange}
                  required
                />
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost text-xs"
                  onClick={handleAutoSlugToggle}
                >
                  Auto
                </button>
              </div>
              <p className="admin-form-help">
                URL-venlig version af titlen. Bruges i adresselinjen.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="admin-form-label">Sortering</label>
              <input
                type="number"
                className="admin-input"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value || "0", 10))}
              />
              <p className="admin-form-help">
                Lavere tal vises først.
              </p>
            </div>

            <div className="pt-8">
              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                Udgivet (synlig på den offentlige side)
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="admin-form-label">Uddrag (valgfrit)</label>
            <textarea
              className="admin-textarea"
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="En kort opsummering af dokumentet..."
            />
          </div>

          <div>
            <label className="admin-form-label">Indhold</label>
            <ArticleRichTextEditor
              content={contentHtml}
              onChange={setContentHtml}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="admin-btn admin-btn-primary px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white transition-all font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          {isPending ? "Gemmer..." : (initialData ? "Gem ændringer" : "Opret dokument")}
        </button>
      </div>
    </form>
  );
};

export default FlightSchoolDocumentForm;
