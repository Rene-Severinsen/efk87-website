"use client";

import React, { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { upsertFlightSchoolPageAction } from "../../../lib/admin/flightSchoolActions";
import { formatAdminDateTime } from "../../../lib/format/adminDateFormat";
import { FlightSchoolPage } from "../../../generated/prisma";

const ArticleRichTextEditor = dynamic(() => import("../articles/ArticleRichTextEditor"), {
  ssr: false,
  loading: () => <div className="h-64 bg-white/5 animate-pulse rounded-lg" />,
});

interface FlightSchoolPageFormProps {
  clubSlug: string;
  initialData: FlightSchoolPage | null;
}

const FlightSchoolPageForm: React.FC<FlightSchoolPageFormProps> = ({
  clubSlug,
  initialData,
}) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState(initialData?.title || "Flyveskole");
  const [intro, setIntro] = useState(initialData?.intro || "");
  const [contentHtml, setContentHtml] = useState(initialData?.contentHtml || "");
  const [isPublished, setIsPublished] = useState(initialData?.isPublished || false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("intro", intro);
    formData.append("contentHtml", contentHtml);
    formData.append("isPublished", String(isPublished));

    startTransition(async () => {
      try {
        await upsertFlightSchoolPageAction(clubSlug, formData);
        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Der skete en fejl");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="admin-card">
        <div className="space-y-4">
          <div>
            <label className="admin-form-label">Titel</label>
            <input
              type="text"
              className="admin-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="admin-form-label">Intro</label>
            <textarea
              className="admin-textarea"
              rows={3}
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="En kort introduktion til flyveskolen..."
            />
          </div>

          <div>
            <label className="admin-form-label">Indhold</label>
            <ArticleRichTextEditor
              content={contentHtml}
              onChange={setContentHtml}
            />
          </div>

          <div>
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

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl">
          Ændringerne er gemt!
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">
          {initialData?.updatedAt && (
            <span>Sidst ændret: {formatAdminDateTime(initialData.updatedAt)}</span>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="admin-btn admin-btn-primary px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white transition-all font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          {isPending ? "Gemmer..." : "Gem ændringer"}
        </button>
      </div>
    </form>
  );
};

export default FlightSchoolPageForm;
