"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import MediaUrlPicker from "../../../../components/admin/media/MediaUrlPicker";
import { updateRulesPageContentAction } from "../../../../lib/admin/rulesPageActions";
import { ClubMediaAssetDTO } from "../../../../lib/media/mediaTypes";
import { ClubRulesPageContent } from "../../../../lib/rulesPage/rulesPageDefaults";

const ArticleRichTextEditor = dynamic(
    () => import("../../../../components/admin/articles/ArticleRichTextEditor"),
    {
        ssr: false,
        loading: () => (
            <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-6 text-sm text-slate-400">
                Editor indlæses...
            </div>
        ),
    },
);

interface RulesPageAdminFormProps {
    clubSlug: string;
    initialContent: ClubRulesPageContent;
    mediaAssets: ClubMediaAssetDTO[];
}

function TextInput({
                       name,
                       label,
                       value,
                       placeholder,
                   }: {
    name: keyof ClubRulesPageContent;
    label: string;
    value: string | null;
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
                defaultValue={value ?? ""}
                placeholder={placeholder}
                className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white placeholder:text-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            />
        </div>
    );
}

export default function RulesPageAdminForm({
                                               clubSlug,
                                               initialContent,
                                               mediaAssets,
                                           }: RulesPageAdminFormProps) {
    const [legalTextHtml, setLegalTextHtml] = useState(initialContent.legalTextHtml);
    const [practicalTextHtml, setPracticalTextHtml] = useState(initialContent.practicalTextHtml);
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsSaving(true);
        setStatus("idle");
        setError(null);

        formData.set("legalTextHtml", legalTextHtml);
        formData.set("practicalTextHtml", practicalTextHtml);

        const result = await updateRulesPageContentAction(clubSlug, formData);

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
                        Sektion 1 — Klubregler og flyvezone
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                        Bruges på public-siden som tydelige links til PDF og flyvezone.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <TextInput
                        name="ownRulesPdfUrl"
                        label="Link til klubbens flyveregler PDF"
                        value={initialContent.ownRulesPdfUrl}
                        placeholder="https://..."
                    />

                    <MediaUrlPicker
                        name="flightZoneImageUrl"
                        label="Billede over flyvezone"
                        value={initialContent.flightZoneImageUrl}
                        assets={mediaAssets}
                        placeholder="Vælg fra Media eller indsæt URL"
                    />
                </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#121b2e]/80 p-6 shadow-2xl backdrop-blur-md">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white">
                        Sektion 2 — Lovtekst
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                        Skriv relevant tekst om lovgivning, myndighedskrav og ansvar.
                    </p>
                </div>

                <input type="hidden" name="legalTextHtml" value={legalTextHtml} />
                <ArticleRichTextEditor
                    content={legalTextHtml}
                    onChange={setLegalTextHtml}
                />
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#121b2e]/80 p-6 shadow-2xl backdrop-blur-md">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white">
                        Sektion 3 — Praktiske retningslinjer
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                        Skriv praktiske regler for støjhensyn, gæster, sikkerhed, færdsel og brug af pladsen.
                    </p>
                </div>

                <input type="hidden" name="practicalTextHtml" value={practicalTextHtml} />
                <ArticleRichTextEditor
                    content={practicalTextHtml}
                    onChange={setPracticalTextHtml}
                />
            </div>

            {status === "success" ? (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-400">
                    Regler og bestemmelser er gemt.
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
                    {isSaving ? "Gemmer..." : "Gem regler"}
                </button>
            </div>
        </form>
    );
}