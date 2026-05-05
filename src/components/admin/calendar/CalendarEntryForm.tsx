"use client";

import React from "react";
import { PublicSurfaceVisibility, ClubCalendarEntry } from "../../../generated/prisma";
import dynamic from "next/dynamic";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import Link from "next/link";
import { AdminPageSection } from "../AdminPagePrimitives";

const ArticleRichTextEditor = dynamic(() => import("../articles/ArticleRichTextEditor"), {
  ssr: false,
});

interface CalendarEntryFormProps {
  clubSlug: string;
  initialData?: ClubCalendarEntry;
  action: (formData: FormData) => Promise<void>;
}

const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <AdminPageSection className={className}>
    {children}
  </AdminPageSection>
);

export default function CalendarEntryForm({
  clubSlug,
  initialData,
  action,
}: CalendarEntryFormProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [descriptionHtml, setDescriptionHtml] = React.useState(initialData?.descriptionHtml || "");
  const isCreateMode = !initialData;

  const formatDateForInput = (date?: Date | null) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

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
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-8">
        <GlassCard className="p-8">
          <div className="space-y-6">
            <div>
              <label className="admin-form-label">Titel *</label>
              <input
                name="title"
                type="text"
                required
                defaultValue={initialData?.title}
                placeholder="F.eks. Klubaften"
                className="admin-input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <div>
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
              <div className="admin-editor-shell">
                <ArticleRichTextEditor
                  content={descriptionHtml}
                  onChange={setDescriptionHtml}
                />
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="space-y-8">
        <GlassCard className="p-8">
          <div className="space-y-8">
            <div>
              <label className="admin-form-label">Synlighed</label>
              <select
                name="visibility"
                defaultValue={initialData?.visibility || PublicSurfaceVisibility.PUBLIC}
                className="admin-select"
              >
                <option value={PublicSurfaceVisibility.PUBLIC}>Offentlig</option>
                <option value={PublicSurfaceVisibility.MEMBERS_ONLY}>Kun medlemmer</option>
              </select>
            </div>

            <label className="admin-checkbox-card">
              <input
                name="isPublished"
                type="checkbox"
                value="true"
                defaultChecked={initialData ? initialData.isPublished : true}
              />
              <div>
                <span className="admin-strong block">Publiceret</span>
                <span className="admin-form-help block">
                  Hvis ikke markeret, vil indslaget kun være synligt for administratorer.
                </span>
              </div>
            </label>

            <label className="admin-checkbox-card">
              <input
                name="forceShowInMarquee"
                type="checkbox"
                value="true"
                defaultChecked={initialData?.forceShowInMarquee}
              />
              <div>
                <span className="admin-strong block">Gennemtving visning i marquee</span>
                <span className="admin-form-help block">
                  Dette vil få indslaget til at optræde i hjemmesidens ticker, selvom det er langt ude i fremtiden.
                </span>
              </div>
            </label>
          </div>
        </GlassCard>

        {isCreateMode ? (
          <GlassCard className="p-8">
            <div className="space-y-5">
              <div>
                <h2 className="admin-section-title">Gentagelse</h2>
                <p className="admin-form-help">
                  Bruges til faste klubaktiviteter, fx klubaften hver torsdag.
                </p>
              </div>

              <label className="admin-checkbox-card">
                <input
                  name="repeatWeekly"
                  type="checkbox"
                  value="true"
                />
                <div>
                  <span className="admin-strong block">Gentag ugentligt</span>
                  <span className="admin-form-help block">
                    Opretter separate kalenderindslag med 7 dage mellem hver.
                  </span>
                </div>
              </label>

              <div>
                <label className="admin-form-label">Antal forekomster</label>
                <input
                  name="repeatCount"
                  type="number"
                  min="1"
                  max="104"
                  defaultValue="52"
                  className="admin-input"
                />
                <p className="admin-form-help">
                  Maks 104. Hvis gentagelse ikke er markeret, oprettes kun ét indslag.
                </p>
              </div>
            </div>
          </GlassCard>
        ) : null}

        <div className="flex flex-col gap-4">
          <button
            type="submit"
            disabled={isPending}
            className="admin-btn admin-btn-primary w-full justify-center"
          >
            {isPending ? "Gemmer..." : "Gem kalenderindslag"}
          </button>

          <Link
            href={`/${clubSlug}/admin/kalender`}
            className="admin-btn w-full justify-center"
          >
            Annuller
          </Link>
        </div>
      </div>
    </form>
  );
}
