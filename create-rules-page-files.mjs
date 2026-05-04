import fs from "fs";
import path from "path";

const root = process.cwd();

function ensureDir(filePath) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeFile(relativePath, content) {
    const absolutePath = path.join(root, relativePath);
    ensureDir(absolutePath);
    fs.writeFileSync(absolutePath, content.trimStart(), "utf8");
    console.log(`Wrote ${relativePath}`);
}

function patchFile(relativePath, patcher) {
    const absolutePath = path.join(root, relativePath);

    if (!fs.existsSync(absolutePath)) {
        console.warn(`Skipped ${relativePath} — file not found`);
        return;
    }

    const current = fs.readFileSync(absolutePath, "utf8");
    const next = patcher(current);

    if (next === current) {
        console.log(`No change ${relativePath}`);
        return;
    }

    fs.writeFileSync(absolutePath, next, "utf8");
    console.log(`Patched ${relativePath}`);
}

writeFile(
    "src/lib/rulesPage/rulesPageDefaults.ts",
    `
export interface ClubRulesPageContent {
  ownRulesPdfUrl: string;
  flightZoneImageUrl: string | null;
  flightZoneImageAlt: string;
  legalTextHtml: string;
  practicalTextHtml: string;
}

export const DEFAULT_RULES_PAGE_CONTENT: ClubRulesPageContent = {
  ownRulesPdfUrl:
    "https://efk87.dk/files/regler/Flyveregler%20for%20Elektroflyveklubben%20af%201987.pdf",
  flightZoneImageUrl: null,
  flightZoneImageAlt: "Flyvezone for Elektroflyveklubben af 1987",
  legalTextHtml:
    "<p>Her kan klubben beskrive relevante lovkrav, myndighedsregler og forhold omkring modelflyvning.</p>",
  practicalTextHtml:
    "<p>Her kan klubben beskrive praktiske retningslinjer for sikkerhed, gæster, støjhensyn, færdsel og almindelig opførsel på pladsen.</p>",
};
`,
);

writeFile(
    "src/lib/rulesPage/rulesPageService.ts",
    `
import prisma from "../db/prisma";
import {
  ClubRulesPageContent,
  DEFAULT_RULES_PAGE_CONTENT,
} from "./rulesPageDefaults";

function normalizeText(value: string | null, fallback: string): string {
  const trimmed = value?.trim();

  return trimmed || fallback;
}

function normalizeNullableText(value: string | null): string | null {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

export async function getClubRulesPageContent(
  clubId: string,
): Promise<ClubRulesPageContent> {
  const rulesPage = await prisma.clubRulesPage.findUnique({
    where: { clubId },
  });

  if (!rulesPage) {
    return DEFAULT_RULES_PAGE_CONTENT;
  }

  return {
    ownRulesPdfUrl: normalizeText(
      rulesPage.ownRulesPdfUrl,
      DEFAULT_RULES_PAGE_CONTENT.ownRulesPdfUrl,
    ),
    flightZoneImageUrl: normalizeNullableText(rulesPage.flightZoneImageUrl),
    flightZoneImageAlt: normalizeText(
      rulesPage.flightZoneImageAlt,
      DEFAULT_RULES_PAGE_CONTENT.flightZoneImageAlt,
    ),
    legalTextHtml: normalizeText(
      rulesPage.legalTextHtml,
      DEFAULT_RULES_PAGE_CONTENT.legalTextHtml,
    ),
    practicalTextHtml: normalizeText(
      rulesPage.practicalTextHtml,
      DEFAULT_RULES_PAGE_CONTENT.practicalTextHtml,
    ),
  };
}

export async function upsertClubRulesPageContent(
  clubId: string,
  content: ClubRulesPageContent,
) {
  return prisma.clubRulesPage.upsert({
    where: { clubId },
    create: {
      clubId,
      ...content,
    },
    update: {
      ...content,
    },
  });
}
`,
);

writeFile(
    "src/lib/admin/rulesPageActions.ts",
    `
"use server";

import { revalidatePath } from "next/cache";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";
import { requireClubAdminForClub } from "../auth/adminAccessGuards";
import { upsertClubRulesPageContent } from "../rulesPage/rulesPageService";
import { DEFAULT_RULES_PAGE_CONTENT } from "../rulesPage/rulesPageDefaults";
import { requireClubBySlug } from "../tenancy/tenantService";

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "strong",
    "b",
    "em",
    "i",
    "ul",
    "ol",
    "li",
    "blockquote",
    "br",
    "a",
    "img",
    "div",
    "span",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    "*": ["class"],
  },
  transformTags: {
    a: (_tagName, attribs) => ({
      tagName: "a",
      attribs: {
        ...attribs,
        rel: "noopener noreferrer",
        target: "_blank",
      },
    }),
  },
};

const optionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : null))
  .refine(
    (value) => {
      if (!value) return true;

      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "URL skal være en gyldig http/https URL." },
  );

const rulesPageSchema = z.object({
  ownRulesPdfUrl: z.string().trim().url("Flyveregler skal være en gyldig URL."),
  flightZoneImageUrl: optionalUrlSchema,
  flightZoneImageAlt: z.string().trim().min(1, "Alt-tekst til flyvezone skal udfyldes."),
  legalTextHtml: z.string().trim().min(1, "Lovtekst skal udfyldes."),
  practicalTextHtml: z.string().trim().min(1, "Praktiske retningslinjer skal udfyldes."),
});

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function updateRulesPageContentAction(
  clubSlug: string,
  formData: FormData,
) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(
    club.id,
    clubSlug,
    \`/\${clubSlug}/admin/regler-og-bestemmelser\`,
  );

  const parsed = rulesPageSchema.safeParse({
    ownRulesPdfUrl: getText(formData, "ownRulesPdfUrl"),
    flightZoneImageUrl: getText(formData, "flightZoneImageUrl"),
    flightZoneImageAlt: getText(formData, "flightZoneImageAlt"),
    legalTextHtml: getText(formData, "legalTextHtml"),
    practicalTextHtml: getText(formData, "practicalTextHtml"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ||
        "Der er ugyldige felter i formularen.",
    };
  }

  await upsertClubRulesPageContent(club.id, {
    ...DEFAULT_RULES_PAGE_CONTENT,
    ownRulesPdfUrl: parsed.data.ownRulesPdfUrl,
    flightZoneImageUrl: parsed.data.flightZoneImageUrl,
    flightZoneImageAlt: parsed.data.flightZoneImageAlt,
    legalTextHtml: sanitizeHtml(parsed.data.legalTextHtml, sanitizeOptions),
    practicalTextHtml: sanitizeHtml(parsed.data.practicalTextHtml, sanitizeOptions),
  });

  revalidatePath(\`/\${clubSlug}/admin/regler-og-bestemmelser\`);
  revalidatePath(\`/\${clubSlug}/om/regler-og-bestemmelser\`);
  revalidatePath(\`/\${clubSlug}/about\`);

  return { success: true };
}
`,
);

writeFile(
    "src/app/[clubSlug]/admin/regler-og-bestemmelser/page.tsx",
    `
import { notFound } from "next/navigation";
import AdminShell from "../../../../components/admin/AdminShell";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { getClubRulesPageContent } from "../../../../lib/rulesPage/rulesPageService";
import RulesPageAdminForm from "./RulesPageAdminForm";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { clubSlug } = await params;

  let club;

  try {
    club = await requireClubBySlug(clubSlug);
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }

    throw error;
  }

  const viewer = await requireClubAdminForClub(
    club.id,
    clubSlug,
    \`/\${clubSlug}/admin/regler-og-bestemmelser\`,
  );

  const content = await getClubRulesPageContent(club.id);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <div className="py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">
            Regler og bestemmelser
          </h1>
          <p className="max-w-3xl text-slate-400">
            Redigér klubbens links til flyveregler, flyvezone, lovtekst og praktiske retningslinjer.
          </p>
        </div>

        <RulesPageAdminForm
          clubSlug={clubSlug}
          initialContent={content}
        />
      </div>
    </AdminShell>
  );
}
`,
);

writeFile(
    "src/app/[clubSlug]/admin/regler-og-bestemmelser/RulesPageAdminForm.tsx",
    `
"use client";

import { useState } from "react";
import ArticleRichTextEditor from "../../../../components/admin/articles/ArticleRichTextEditor";
import { updateRulesPageContentAction } from "../../../../lib/admin/rulesPageActions";
import { ClubRulesPageContent } from "../../../../lib/rulesPage/rulesPageDefaults";

interface RulesPageAdminFormProps {
  clubSlug: string;
  initialContent: ClubRulesPageContent;
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

          <TextInput
            name="flightZoneImageUrl"
            label="Link til billede over flyvezone"
            value={initialContent.flightZoneImageUrl}
            placeholder="https://..."
          />

          <TextInput
            name="flightZoneImageAlt"
            label="Alt-tekst til flyvezone"
            value={initialContent.flightZoneImageAlt}
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
`,
);

writeFile(
    "src/app/[clubSlug]/om/regler-og-bestemmelser/page.tsx",
    `
import { resolvePublicPageForClub } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { publicRoutes } from "../../../../lib/publicRoutes";
import { getClubRulesPageContent } from "../../../../lib/rulesPage/rulesPageService";

interface RulesPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

function RichTextBlock({ html }: { html: string }) {
  return (
    <div
      className="space-y-4 text-base font-normal leading-relaxed text-[var(--public-text)] [&_a]:font-semibold [&_a]:text-[var(--public-primary)] [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--public-primary)] [&_blockquote]:pl-4 [&_blockquote]:text-[var(--public-text-muted)] [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:text-xl [&_h3]:font-bold [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default async function RulesPage({ params }: RulesPageProps) {
  const { clubSlug } = await params;
  const pageSlug = "regler-og-bestemmelser";

  const {
    club,
    theme,
    footerData,
    navigationItems,
    actionItems,
    publicSettings,
  } = await resolvePublicPageForClub(clubSlug, pageSlug);

  const content = await getClubRulesPageContent(club.id);

  return (
    <ThemedClubPageShell
      clubSlug={clubSlug}
      clubName={club.settings?.shortName || club.name}
      clubDisplayName={publicSettings?.displayName || club.settings?.displayName || club.name}
      theme={theme}
      publicThemeMode={publicSettings?.publicThemeMode}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title="Regler og bestemmelser"
      subtitle="Her finder du klubbens flyveregler, flyvezone, lovtekst og praktiske retningslinjer."
      currentPath={publicRoutes.rules(clubSlug)}
      maxWidth="1120px"
    >
      <div className="mt-6 space-y-6">
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ThemedSectionCard className="flex h-full flex-col p-5 sm:p-6">
            <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
              Klubbens flyveregler
            </h2>

            <p className="mt-3 text-base font-normal leading-relaxed text-[var(--public-text)]">
              Her finder du Elektroflyveklubben af 1987&apos;s egne flyveregler.
              Reglerne gælder for brug af klubbens flyveplads og skal følges af medlemmer og gæster.
            </p>

            <div className="mt-auto pt-6">
              <a
                href={content.ownRulesPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="public-primary-button"
              >
                Åbn flyveregler
              </a>
            </div>
          </ThemedSectionCard>

          <ThemedSectionCard className="flex h-full flex-col p-5 sm:p-6">
            <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
              Flyvezone
            </h2>

            <p className="mt-3 text-base font-normal leading-relaxed text-[var(--public-text)]">
              Flyvezonen viser det område, hvor der må flyves. Brug den som praktisk reference,
              når du planlægger flyvning på pladsen.
            </p>

            {content.flightZoneImageUrl ? (
              <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)]">
                <img
                  src={content.flightZoneImageUrl}
                  alt={content.flightZoneImageAlt}
                  className="h-auto w-full object-cover"
                />
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-primary-soft)] p-5 text-sm font-semibold text-[var(--public-primary)]">
                Billede over flyvezone tilføjes senere i Admin.
              </div>
            )}

            {content.flightZoneImageUrl ? (
              <div className="mt-auto pt-6">
                <a
                  href={content.flightZoneImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="public-secondary-button"
                >
                  Åbn flyvezone
                </a>
              </div>
            ) : null}
          </ThemedSectionCard>
        </section>

        <ThemedSectionCard className="p-5 sm:p-6">
          <h2 className="mb-4 text-xl font-bold text-[var(--public-text)] sm:text-2xl">
            Lovtekst og myndighedsregler
          </h2>

          <RichTextBlock html={content.legalTextHtml} />
        </ThemedSectionCard>

        <ThemedSectionCard className="p-5 sm:p-6">
          <h2 className="mb-4 text-xl font-bold text-[var(--public-text)] sm:text-2xl">
            Praktiske retningslinjer
          </h2>

          <RichTextBlock html={content.practicalTextHtml} />
        </ThemedSectionCard>
      </div>
    </ThemedClubPageShell>
  );
}
`,
);

patchFile("src/lib/publicRoutes.ts", (current) => {
    if (current.includes("rules:")) return current;

    return current.replace(
        /contact:\s*\(clubSlug:\s*string\)\s*=>\s*`\/\$\{clubSlug\}\/om\/kontakt`,/,
        `contact: (clubSlug: string) => \`/\${clubSlug}/om/kontakt\`,
  rules: (clubSlug: string) => \`/\${clubSlug}/om/regler-og-bestemmelser\`,`,
    );
});

patchFile("src/components/admin/AdminSidebar.tsx", (current) => {
    if (current.includes("/admin/regler-og-bestemmelser")) return current;

    return current.replace(
        /<a\s+href={`\/\$\{clubSlug\}\/admin\/her-bor-vi`}[\s\S]*?<\/a>/,
        (match) =>
            `${match}
          <a
            href={\`/\${clubSlug}/admin/regler-og-bestemmelser\`}
            className={\`admin-sidebar-item \${pathname?.startsWith(\`/\${clubSlug}/admin/regler-og-bestemmelser\`) ? "active" : ""}\`}
          >
            Regler og bestemmelser
          </a>`,
    );
});

patchFile("src/app/[clubSlug]/about/page.tsx", (current) => {
    if (current.includes("href: publicRoutes.rules(clubSlug)")) return current;

    return current.replace(
        /{\s*title:\s*"Regler og bestemmelser",\s*description:\s*"Vedtægter, regler og retningslinjer for klubben\.",\s*icon:\s*"📘",\s*available:\s*false,\s*}/,
        `{
      title: "Regler og bestemmelser",
      description: "Vedtægter, regler og retningslinjer for klubben.",
      icon: "📘",
      href: publicRoutes.rules(clubSlug),
      available: true,
    }`,
    );
});

console.log("");
console.log("Done.");
console.log("Next:");
console.log("npx prisma db push");
console.log("npx prisma generate");
console.log("rm -rf .next");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");