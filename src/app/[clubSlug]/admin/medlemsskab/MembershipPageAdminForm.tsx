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
      {helpText ? (
        <p className="text-xs text-slate-500">
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
      <div className="rounded-3xl border border-white/10 bg-[#121b2e]/80 p-6 shadow-2xl backdrop-blur-md">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">
            Intro og indmeldelse
          </h2>
          <p className="mt-1 text-sm text-slate-400">
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
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
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

            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
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

            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
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

      <div className="rounded-3xl border border-white/10 bg-[#121b2e]/80 p-6 shadow-2xl backdrop-blur-md">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              Kontingenter
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Priser og medlemsformer kan ændres uden kode.
            </p>
          </div>

          <button
            type="button"
            onClick={addFee}
            className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15"
          >
            Tilføj kontingent
          </button>
        </div>

        <input type="hidden" name="feesJson" value={feesJson} />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {fees.map((fee, index) => (
            <div
              key={index}
              className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-white">
                  Kontingent {index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() => removeFee(index)}
                  className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20"
                >
                  Fjern
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Navn
                  </label>
                  <input
                    value={fee.title}
                    onChange={(event) => updateFee(index, { title: event.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Pris
                  </label>
                  <input
                    value={fee.price}
                    onChange={(event) => updateFee(index, { price: event.target.value })}
                    placeholder="fx 750 kr."
                    className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Indmeldelsesgebyr
                  </label>
                  <input
                    value={fee.signupFee}
                    onChange={(event) => updateFee(index, { signupFee: event.target.value })}
                    placeholder="fx 250 kr."
                    className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Periode
                  </label>
                  <input
                    value={fee.period}
                    onChange={(event) => updateFee(index, { period: event.target.value })}
                    placeholder="pr. år"
                    className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Sortering
                  </label>
                  <input
                    type="number"
                    value={fee.sortOrder}
                    onChange={(event) => updateFee(index, { sortOrder: Number(event.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  />
                </div>
              </div>

              <div className="mt-4 flex-1 space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Beskrivelse
                </label>
                <textarea
                  value={fee.description}
                  onChange={(event) => updateFee(index, { description: event.target.value })}
                  rows={3}
                  className="w-full resize-y rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                />
              </div>

              <label className="mt-4 flex items-center gap-3 text-sm font-medium text-slate-300">
                <input
                  type="checkbox"
                  checked={fee.isActive}
                  onChange={(event) => updateFee(index, { isActive: event.target.checked })}
                  className="h-4 w-4 rounded border-white/10 bg-[#0f172a]"
                />
                Vis på public-siden
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#121b2e]/80 p-6 shadow-2xl backdrop-blur-md">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">
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
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-400">
          Medlemsskab er gemt.
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
          {isSaving ? "Gemmer..." : "Gem medlemsskab"}
        </button>
      </div>
    </form>
  );
}
