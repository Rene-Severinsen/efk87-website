"use client";

import React from "react";
import dynamic from "next/dynamic";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import Link from "next/link";
import { ClubCalendarEntry } from "../../../generated/prisma";

const ArticleRichTextEditor = dynamic(() => import("../articles/ArticleRichTextEditor"), {
  ssr: false,
});

interface CalendarEntryFormProps {
  clubSlug: string;
  initialData?: ClubCalendarEntry;
  action: (formData: FormData) => Promise<void>;
}

export default function CalendarEntryForm({
  clubSlug,
  initialData,
  action,
}: CalendarEntryFormProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [descriptionHtml, setDescriptionHtml] = React.useState(initialData?.descriptionHtml || "");

  // Helper to format date for input[type="date"]
  const formatDateForInput = (date?: Date | null) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  // Helper to format time for input[type="time"]
  const formatTimeForInput = (date?: Date | null) => {
    if (!date) return "";
    return date.toTimeString().slice(0, 5);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    formData.set("descriptionHtml", descriptionHtml);
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
    <form onSubmit={handleSubmit} className="admin-calendar-form" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
      <div className="admin-calendar-form-main" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="admin-card">
          <div style={{ marginBottom: '20px' }}>
            <label className="admin-form-label">Titel *</label>
            <input
              name="title"
              type="text"
              required
              defaultValue={initialData?.title}
              placeholder="F.eks. Byggemøde"
              className="admin-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label className="admin-form-label">Dato *</label>
              <input
                name="date"
                type="date"
                required
                defaultValue={formatDateForInput(initialData?.startsAt)}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-form-label">Starttidspunkt</label>
              <input
                name="startTime"
                type="time"
                defaultValue={formatTimeForInput(initialData?.startsAt)}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-form-label">Sluttidspunkt</label>
              <input
                name="endTime"
                type="time"
                defaultValue={formatTimeForInput(initialData?.endsAt)}
                className="admin-input"
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="admin-form-label">Lokation</label>
            <input
              name="location"
              type="text"
              defaultValue={initialData?.location || ""}
              placeholder="F.eks. Klubhuset eller Solvanghallen"
              className="admin-input"
            />
          </div>

          <div>
            <label className="admin-form-label">Beskrivelse</label>
            <div className="admin-rich-text-wrapper" style={{ 
              borderRadius: '8px', 
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <ArticleRichTextEditor
                content={descriptionHtml}
                onChange={setDescriptionHtml}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="admin-calendar-form-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="admin-card">
          <div style={{ marginBottom: '20px' }}>
            <label className="admin-checkbox-label">
              <input
                name="isPublished"
                type="checkbox"
                value="true"
                defaultChecked={initialData ? initialData.isPublished : true}
                className="admin-checkbox"
              />
              Publiceret
            </label>
            <p className="admin-form-help" style={{ marginLeft: '28px' }}>
              Hvis ikke markeret, vil indslaget kun være synligt for administratorer.
            </p>
          </div>

          <div>
            <label className="admin-checkbox-label">
              <input
                name="forceShowInMarquee"
                type="checkbox"
                value="true"
                defaultChecked={initialData?.forceShowInMarquee}
                className="admin-checkbox"
              />
              Gennemtving visning i marquee
            </label>
            <p className="admin-form-help" style={{ marginLeft: '28px' }}>
              Dette vil få indslaget til at optræde i hjemmesidens ticker, selvom det er langt ude i fremtiden.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            type="submit"
            disabled={isPending}
            className="admin-btn admin-btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            {isPending ? 'Gemmer...' : 'Gem kalenderindslag'}
          </button>
          <Link
            href={`/${clubSlug}/admin/kalender`}
            className="admin-btn"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            Annuller
          </Link>
        </div>
      </div>
    </form>
  );
}
