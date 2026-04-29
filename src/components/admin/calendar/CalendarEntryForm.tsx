"use client";

import React from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import Link from "next/link";
import { ClubCalendarEntry } from "../../../generated/prisma";
import ArticleRichTextEditor from "../articles/ArticleRichTextEditor";

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
      <div className="admin-calendar-form-main" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="admin-card" style={{ padding: '24px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>Titel *</label>
            <input
              name="title"
              type="text"
              required
              defaultValue={initialData?.title}
              placeholder="F.eks. Byggemøde"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>Dato *</label>
              <input
                name="date"
                type="date"
                required
                defaultValue={formatDateForInput(initialData?.startsAt)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>Starttidspunkt</label>
              <input
                name="startTime"
                type="time"
                defaultValue={formatTimeForInput(initialData?.startsAt)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>Sluttidspunkt</label>
              <input
                name="endTime"
                type="time"
                defaultValue={formatTimeForInput(initialData?.endsAt)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>Lokation</label>
            <input
              name="location"
              type="text"
              defaultValue={initialData?.location || ""}
              placeholder="F.eks. Klubhuset eller Solvanghallen"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>Beskrivelse</label>
            <ArticleRichTextEditor
              content={descriptionHtml}
              onChange={setDescriptionHtml}
            />
          </div>
        </div>
      </div>

      <div className="admin-calendar-form-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="admin-card" style={{ padding: '24px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}>
              <input
                name="isPublished"
                type="checkbox"
                value="true"
                defaultChecked={initialData ? initialData.isPublished : true}
              />
              Publiceret
            </label>
            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px', marginLeft: '24px' }}>
              Hvis ikke markeret, vil indslaget kun være synligt for administratorer.
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}>
              <input
                name="forceShowInMarquee"
                type="checkbox"
                value="true"
                defaultChecked={initialData?.forceShowInMarquee}
              />
              Gennemtving visning i marquee
            </label>
            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px', marginLeft: '24px' }}>
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
