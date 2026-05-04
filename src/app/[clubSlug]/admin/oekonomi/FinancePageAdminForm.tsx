"use client";

import { useState } from "react";
import { updateFinancePageContentAction } from "../../../../lib/admin/financePageActions";
import { ClubFinancePageContent } from "../../../../lib/financePage/financePageDefaults";

interface FinancePageAdminFormProps {
  clubSlug: string;
  initialContent: ClubFinancePageContent;
}

function TextInput({
  name,
  label,
  value,
  placeholder,
}: {
  name: keyof ClubFinancePageContent;
  label: string;
  value: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={value}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white placeholder:text-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/50"
      />
    </div>
  );
}

function TextArea({
  name,
  label,
  value,
  rows = 4,
}: {
  name: keyof ClubFinancePageContent;
  label: string;
  value: string;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        defaultValue={value}
        rows={rows}
        className="w-full resize-y rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white placeholder:text-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/50"
      />
    </div>
  );
}

export default function FinancePageAdminForm({
  clubSlug,
  initialContent,
}: FinancePageAdminFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    setStatus("idle");
    setError(null);

    const result = await updateFinancePageContentAction(clubSlug, formData);

    setIsSaving(false);

    if (result.success) {
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
      return;
    }

    setStatus("error");
    setError(result.error || "Der skete en fejl ved gemning.");
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-[#121b2e]/80 p-6 shadow-2xl backdrop-blur-md">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">
            Udgiftsbilag og refusion
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Teksterne vises på den offentlige Økonomi-side.
          </p>
        </div>

        <div className="space-y-6">
          <TextArea
            name="introText"
            label="Intro"
            value={initialContent.introText}
            rows={4}
          />

          <TextInput
            name="expenseEmail"
            label="Bilagsmail"
            value={initialContent.expenseEmail}
            placeholder="bilag@efk87.dk"
          />

          <TextArea
            name="requiredInfoText"
            label="Oplysninger på udgiftsbilag"
            value={initialContent.requiredInfoText}
            rows={5}
          />

          <TextArea
            name="approvalText"
            label="Forhåndsgodkendelse"
            value={initialContent.approvalText}
            rows={4}
          />

          <TextArea
            name="advanceText"
            label="Forskud"
            value={initialContent.advanceText}
            rows={4}
          />

          <TextArea
            name="payoutText"
            label="Udbetaling"
            value={initialContent.payoutText}
            rows={4}
          />
        </div>
      </div>

      {status === "success" ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-400">
          Økonomi-indholdet er gemt.
        </div>
      ) : null}

      {status === "error" && error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-medium text-rose-400">
          {error}
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-sky-600 px-8 py-3 font-bold text-white shadow-lg shadow-sky-900/20 transition-all hover:bg-sky-500 disabled:bg-slate-700 disabled:shadow-none"
        >
          {isSaving ? "Gemmer..." : "Gem økonomi"}
        </button>
      </div>
    </form>
  );
}
