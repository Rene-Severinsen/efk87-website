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

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`backdrop-blur-md bg-[#121b2e]/80 border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden ${className}`}>
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500/50 to-emerald-500/50 opacity-30" />
    {children}
  </div>
);

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

  const inputClasses = "w-full bg-slate-950/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all";
  const labelClasses = "block text-sm font-bold text-slate-400 mb-2 ml-1 uppercase tracking-wider";

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-8">
        <GlassCard className="p-8">
          <div className="space-y-6">
            <div>
              <label className={labelClasses}>Titel *</label>
              <input
                name="title"
                type="text"
                required
                defaultValue={initialData?.title}
                placeholder="F.eks. Byggemøde"
                className={inputClasses}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClasses}>Dato *</label>
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={formatDateForInput(initialData?.startsAt)}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Starttidspunkt</label>
                <input
                  name="startTime"
                  type="time"
                  defaultValue={formatTimeForInput(initialData?.startsAt)}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Sluttidspunkt</label>
                <input
                  name="endTime"
                  type="time"
                  defaultValue={formatTimeForInput(initialData?.endsAt)}
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Lokation</label>
              <input
                name="location"
                type="text"
                defaultValue={initialData?.location || ""}
                placeholder="F.eks. Klubhuset eller Solvanghallen"
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Beskrivelse</label>
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-950/20">
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
            <label className="flex items-start gap-4 group cursor-pointer">
              <div className="relative flex items-center pt-0.5">
                <input
                  name="isPublished"
                  type="checkbox"
                  value="true"
                  defaultChecked={initialData ? initialData.isPublished : true}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/20 bg-white/5 transition-all checked:bg-sky-500 checked:border-sky-500"
                />
                <svg className="absolute h-5 w-5 pointer-events-none hidden peer-checked:block text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <span className="text-white font-bold block group-hover:text-sky-400 transition-colors">Publiceret</span>
                <span className="text-sm text-slate-500 block mt-1">Hvis ikke markeret, vil indslaget kun være synligt for administratorer.</span>
              </div>
            </label>

            <label className="flex items-start gap-4 group cursor-pointer">
              <div className="relative flex items-center pt-0.5">
                <input
                  name="forceShowInMarquee"
                  type="checkbox"
                  value="true"
                  defaultChecked={initialData?.forceShowInMarquee}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/20 bg-white/5 transition-all checked:bg-sky-500 checked:border-sky-500"
                />
                <svg className="absolute h-5 w-5 pointer-events-none hidden peer-checked:block text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <span className="text-white font-bold block group-hover:text-sky-400 transition-colors">Gennemtving visning i marquee</span>
                <span className="text-sm text-slate-500 block mt-1">Dette vil få indslaget til at optræde i hjemmesidens ticker, selvom det er langt ude i fremtiden.</span>
              </div>
            </label>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-4">
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white font-extrabold text-lg transition-all shadow-xl shadow-sky-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Gemmer...' : 'Gem kalenderindslag'}
          </button>
          <Link
            href={`/${clubSlug}/admin/kalender`}
            className="w-full flex items-center justify-center px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10"
          >
            Annuller
          </Link>
        </div>
      </div>
    </form>
  );
}
