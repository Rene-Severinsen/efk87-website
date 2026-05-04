"use client";

import React from "react";
import dynamic from "next/dynamic";
import { isRedirectError } from "next/dist/client/components/redirect-error";

const ArticleRichTextEditor = dynamic(
    () => import("../admin/articles/ArticleRichTextEditor"),
    {
      ssr: false,
    }
);

interface ReplyFormProps {
  action: (formData: FormData) => Promise<void>;
}

export default function ReplyForm({ action }: ReplyFormProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [bodyHtml, setBodyHtml] = React.useState("");

  const isEmptyReply = !bodyHtml || bodyHtml === "<p></p>";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    formData.set("bodyHtml", bodyHtml);

    try {
      await action(formData);
      setBodyHtml("");
      formElement.reset();
      setIsPending(false);
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
      <form onSubmit={handleSubmit} className="mt-12">
        <div className="rounded-3xl border border-[var(--public-card-border)] bg-[var(--public-card)] p-6 shadow-[var(--public-shadow)] sm:p-8">
          <label className="public-label mb-4 uppercase tracking-widest">
            Skriv et svar
          </label>

          <div className="mb-6 overflow-hidden rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-card)]">
            <ArticleRichTextEditor content={bodyHtml} onChange={setBodyHtml} />
          </div>

          <div className="flex justify-end">
            <button
                type="submit"
                disabled={isPending || isEmptyReply}
                className="public-primary-button px-8 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Sender..." : "Send svar"}
            </button>
          </div>
        </div>
      </form>
  );
}