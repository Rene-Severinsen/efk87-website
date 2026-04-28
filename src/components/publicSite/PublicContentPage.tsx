import React from "react";
import PublicClubShell from "./PublicClubShell";

interface Club {
  id: string;
  name: string;
  slug: string;
  settings?: {
    displayName: string;
    shortName: string;
  } | null;
}

interface PublicContentPageProps {
  club: Club;
  title: string;
  body: string;
  fallbackTitle?: string;
  fallbackBody?: string;
  variant?: 'card' | 'full';
}

/**
 * Reusable component for rendering a standard public content page.
 * Renders inside PublicClubShell.
 */
export default function PublicContentPage({
  club,
  title,
  body,
  fallbackTitle,
  fallbackBody,
  variant = 'card',
}: PublicContentPageProps) {
  const displayTitle = title || fallbackTitle || "Content Page";
  const displayBody = body || fallbackBody || "Content will be added soon.";

  return (
    <PublicClubShell club={club}>
      {variant === 'card' ? (
        <div className="flex flex-col items-center justify-center p-6 text-slate-900 mt-12">
          <div className="max-w-2xl w-full bg-white rounded-xl shadow-sm border border-slate-200 p-12">
            <h1 className="text-4xl font-bold tracking-tight mb-6">
              {displayTitle}
            </h1>
            <p className="text-lg text-slate-600">
              {displayBody}
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">{displayTitle}</h1>
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-600">{displayBody}</p>
          </div>
        </div>
      )}
    </PublicClubShell>
  );
}
