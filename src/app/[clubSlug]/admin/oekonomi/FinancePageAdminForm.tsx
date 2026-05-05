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
      <label htmlFor={name} className="admin-form-label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={value}
        placeholder={placeholder}
        className="admin-input"
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
      <label htmlFor={name} className="admin-form-label">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        defaultValue={value}
        rows={rows}
        className="admin-textarea"
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
      <div className="admin-card">
        <div className="mb-6">
          <h2 className="admin-section-title">
            Udgiftsbilag og refusion
          </h2>
          <p className="admin-muted">
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
        <div className="admin-alert admin-alert-success">
          Økonomi-indholdet er gemt.
        </div>
      ) : null}

      {status === "error" && error ? (
        <div className="admin-alert admin-alert-danger">
          {error}
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="admin-btn admin-btn-primary"
        >
          {isSaving ? "Gemmer..." : "Gem økonomi"}
        </button>
      </div>
    </form>
  );
}
