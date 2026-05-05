"use client";

import { useMemo, useState } from "react";
import { updateMembershipPageContentAction } from "../../../../lib/admin/membershipPageActions";
import {
  ClubMembershipPageContent,
  MembershipFeeContent,
} from "../../../../lib/membershipPage/membershipPageDefaults";

interface MembershipPageAdminFormProps {
  clubSlug: string;
  initialContent: ClubMembershipPageContent;
}

function TextInput({
  name,
  label,
  value,
  placeholder,
}: {
  name: keyof ClubMembershipPageContent;
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
  helpText,
}: {
  name: keyof ClubMembershipPageContent;
  label: string;
  value: string;
  rows?: number;
  helpText?: string;
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
      {helpText ? (
        <p className="admin-form-help">
          {helpText}
        </p>
      ) : null}
    </div>
  );
}

function createEmptyFee(sortOrder: number): MembershipFeeContent {
  return {
    title: "",
    price: "",
    signupFee: "",
    period: "pr. år",
    description: "",
    sortOrder,
    isActive: true,
  };
}

export default function MembershipPageAdminForm({
  clubSlug,
  initialContent,
}: MembershipPageAdminFormProps) {
  const [fees, setFees] = useState<MembershipFeeContent[]>(initialContent.fees);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const feesJson = useMemo(() => JSON.stringify(fees), [fees]);

  function updateFee(index: number, patch: Partial<MembershipFeeContent>) {
    setFees((current) =>
      current.map((fee, feeIndex) =>
        feeIndex === index ? { ...fee, ...patch } : fee,
      ),
    );
  }

  function addFee() {
    setFees((current) => [...current, createEmptyFee((current.length + 1) * 10)]);
  }

  function removeFee(index: number) {
    setFees((current) => current.filter((_fee, feeIndex) => feeIndex !== index));
  }

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    setStatus("idle");
    setError(null);

    formData.set("feesJson", feesJson);

    const result = await updateMembershipPageContentAction(clubSlug, formData);

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
            Intro og indmeldelse
          </h2>
          <p className="admin-muted">
            Forklar den selvbetjente indmeldelse og de tre trin frem til aktiveret medlemskab.
          </p>
        </div>

        <div className="space-y-6">
          <TextArea
            name="introText"
            label="Intro"
            value={initialContent.introText}
            rows={3}
          />

          <TextArea
            name="processIntro"
            label="Intro til indmeldelsesproces"
            value={initialContent.processIntro}
            rows={3}
          />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="space-y-4 rounded-2xl border bg-white/[0.03] p-5">
              <TextInput
                name="stepOneTitle"
                label="Trin 1 titel"
                value={initialContent.stepOneTitle}
              />
              <TextArea
                name="stepOneText"
                label="Trin 1 tekst"
                value={initialContent.stepOneText}
                rows={4}
              />
            </div>

            <div className="space-y-4 rounded-2xl border bg-white/[0.03] p-5">
              <TextInput
                name="stepTwoTitle"
                label="Trin 2 titel"
                value={initialContent.stepTwoTitle}
              />
              <TextArea
                name="stepTwoText"
                label="Trin 2 tekst"
                value={initialContent.stepTwoText}
                rows={4}
              />
            </div>

            <div className="space-y-4 rounded-2xl border bg-white/[0.03] p-5">
              <TextInput
                name="stepThreeTitle"
                label="Trin 3 titel"
                value={initialContent.stepThreeTitle}
              />
              <TextArea
                name="stepThreeText"
                label="Trin 3 tekst"
                value={initialContent.stepThreeText}
                rows={4}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="admin-section-title">
              Kontingenter
            </h2>
            <p className="admin-muted">
              Priser og medlemsformer kan ændres uden kode.
            </p>
          </div>

          <button
            type="button"
            onClick={addFee}
            className="admin-btn"
          >
            Tilføj kontingent
          </button>
        </div>

        <input type="hidden" name="feesJson" value={feesJson} />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {fees.map((fee, index) => (
            <div
              key={index}
              className="flex h-full flex-col rounded-2xl border bg-white/[0.03] p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="admin-section-title">
                  Kontingent {index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() => removeFee(index)}
                  className="admin-btn admin-btn-danger"
                >
                  Fjern
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="admin-form-label">
                    Navn
                  </label>
                  <input
                    value={fee.title}
                    onChange={(event) => updateFee(index, { title: event.target.value })}
                    className="admin-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="admin-form-label">
                    Pris
                  </label>
                  <input
                    value={fee.price}
                    onChange={(event) => updateFee(index, { price: event.target.value })}
                    placeholder="fx 750 kr."
                    className="admin-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="admin-form-label">
                    Indmeldelsesgebyr
                  </label>
                  <input
                    value={fee.signupFee}
                    onChange={(event) => updateFee(index, { signupFee: event.target.value })}
                    placeholder="fx 250 kr."
                    className="admin-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="admin-form-label">
                    Periode
                  </label>
                  <input
                    value={fee.period}
                    onChange={(event) => updateFee(index, { period: event.target.value })}
                    placeholder="pr. år"
                    className="admin-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="admin-form-label">
                    Sortering
                  </label>
                  <input
                    type="number"
                    value={fee.sortOrder}
                    onChange={(event) => updateFee(index, { sortOrder: Number(event.target.value) })}
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="mt-4 flex-1 space-y-2">
                <label className="admin-form-label">
                  Beskrivelse
                </label>
                <textarea
                  value={fee.description}
                  onChange={(event) => updateFee(index, { description: event.target.value })}
                  rows={3}
                  className="admin-textarea"
                />
              </div>

              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  checked={fee.isActive}
                  onChange={(event) => updateFee(index, { isActive: event.target.checked })}
                  className="admin-checkbox"
                />
                Vis på public-siden
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-card">
        <div className="mb-6">
          <h2 className="admin-section-title">
            Opkrævning og praktisk information
          </h2>
        </div>

        <div className="space-y-6">
          <TextArea
            name="paymentText"
            label="Opkrævning og betaling"
            value={initialContent.paymentText}
            rows={5}
            helpText="Beskriv faktura, betalingsreference og hvornår medlemskabet aktiveres."
          />

          <TextArea
            name="practicalText"
            label="Praktisk information"
            value={initialContent.practicalText}
            rows={5}
          />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <TextInput
              name="ctaLabel"
              label="CTA til indmeldelse"
              value={initialContent.ctaLabel}
            />

            <TextInput
              name="contactCtaLabel"
              label="CTA til kontakt"
              value={initialContent.contactCtaLabel}
            />
          </div>
        </div>
      </div>

      {status === "success" ? (
        <div className="admin-alert admin-alert-success">
          Medlemsskab er gemt.
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
          {isSaving ? "Gemmer..." : "Gem medlemsskab"}
        </button>
      </div>
    </form>
  );
}
