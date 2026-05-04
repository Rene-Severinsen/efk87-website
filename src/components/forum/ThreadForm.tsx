"use client";

import React from "react";
import dynamic from "next/dynamic";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import Link from "next/link";

import { publicRoutes } from "../../lib/publicRoutes";

const ArticleRichTextEditor = dynamic(
    () => import("../admin/articles/ArticleRichTextEditor"),
    {
      ssr: false,
    }
);

interface ThreadFormProps {
  clubSlug: string;
  categorySlug: string;
  categoryTitle: string;
  action: (formData: FormData) => Promise<void>;
}

export default function ThreadForm({
                                     clubSlug,
                                     categorySlug,
                                     action,
                                   }: ThreadFormProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [bodyHtml, setBodyHtml] = React.useState("");

  const isEmptyBody = !bodyHtml || bodyHtml === "<p></p>";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    formData.set("bodyHtml", bodyHtml);

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
      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <div className="rounded-3xl border border-[var(--public-card-border)] bg-[var(--public-card)] p-6 shadow-[var(--public-shadow)] sm:p-8">
          <div className="space-y-8">
            <div>
              <label htmlFor="title" className="public-label uppercase tracking-widest">
                Trådens titel
              </label>

              <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="Hvad vil du gerne tale om?"
                  className="public-input text-lg"
                  autoFocus
              />
            </div>

            <div>
              <label className="public-label uppercase tracking-widest">
                Indhold
              </label>

              <div className="overflow-hidden rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-card)]">
                <ArticleRichTextEditor content={bodyHtml} onChange={setBodyHtml} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Link
              href={publicRoutes.forumCategory(clubSlug, categorySlug)}
              className="public-secondary-button px-8"
          >
            Annuller
          </Link>

          <button
              type="submit"
              disabled={isPending || isEmptyBody}
              className="public-primary-button px-8 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Opretter..." : "Opret tråd"}
          </button>
        </div>
      </form>
  );
}