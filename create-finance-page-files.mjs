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

patchFile("prisma/schema.prisma", (current) => {
    let next = current;

    if (!next.includes("financePage ClubFinancePage?")) {
        next = next.replace(
            /(model Club\s*{[\s\S]*?)(\n\s*membershipPage\s+ClubMembershipPage\?)/,
            `$1
  financePage ClubFinancePage?$2`,
        );
    }

    if (!next.includes("model ClubFinancePage")) {
        next += `

model ClubFinancePage {
  id     String @id @default(cuid())
  clubId String @unique

  introText           String @db.Text
  expenseEmail        String
  requiredInfoText    String @db.Text
  approvalText        String @db.Text
  advanceText         String @db.Text
  payoutText          String @db.Text

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  club Club @relation(fields: [clubId], references: [id])
}
`;
    }

    return next;
});

writeFile(
    "src/lib/financePage/financePageDefaults.ts",
    `
export interface ClubFinancePageContent {
  introText: string;
  expenseEmail: string;
  requiredInfoText: string;
  approvalText: string;
  advanceText: string;
  payoutText: string;
}

export const DEFAULT_FINANCE_PAGE_CONTENT: ClubFinancePageContent = {
  introText:
    "Har man haft godkendte udgifter, som skal refunderes af klubben, bedes udgiftsbilaget sendes som vedhæftet fil til klubbens bilagsmail.",
  expenseEmail: "bilag@efk87.dk",
  requiredInfoText:
    "På udgiftsbilaget skrives navn, MobilePay-nummer eller bankoplysninger med registreringsnummer og kontonummer.",
  approvalText:
    "Alle udlæg skal aftales med kassereren eller et andet bestyrelsesmedlem, inden der købes ind.",
  advanceText:
    "Hvis du forventes at indkøbe for kr. 1.000,- eller mere, kan du efter aftale med kassereren få udbetalt et forskud.",
  payoutText:
    "Når du har indsendt bilag på den afholdte udgift, vil beløbet blive overført til dig inden for 3 uger efter indlevering af bilag.",
};
`,
);

writeFile(
    "src/lib/financePage/financePageService.ts",
    `
import prisma from "../db/prisma";
import {
  ClubFinancePageContent,
  DEFAULT_FINANCE_PAGE_CONTENT,
} from "./financePageDefaults";

function normalizeText(value: string | null, fallback: string): string {
  const trimmed = value?.trim();

  return trimmed || fallback;
}

export async function getClubFinancePageContent(
  clubId: string,
): Promise<ClubFinancePageContent> {
  const financePage = await prisma.clubFinancePage.findUnique({
    where: { clubId },
  });

  if (!financePage) {
    return DEFAULT_FINANCE_PAGE_CONTENT;
  }

  return {
    introText: normalizeText(financePage.introText, DEFAULT_FINANCE_PAGE_CONTENT.introText),
    expenseEmail: normalizeText(financePage.expenseEmail, DEFAULT_FINANCE_PAGE_CONTENT.expenseEmail),
    requiredInfoText: normalizeText(financePage.requiredInfoText, DEFAULT_FINANCE_PAGE_CONTENT.requiredInfoText),
    approvalText: normalizeText(financePage.approvalText, DEFAULT_FINANCE_PAGE_CONTENT.approvalText),
    advanceText: normalizeText(financePage.advanceText, DEFAULT_FINANCE_PAGE_CONTENT.advanceText),
    payoutText: normalizeText(financePage.payoutText, DEFAULT_FINANCE_PAGE_CONTENT.payoutText),
  };
}

export async function upsertClubFinancePageContent(
  clubId: string,
  content: ClubFinancePageContent,
) {
  return prisma.clubFinancePage.upsert({
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
    "src/lib/admin/financePageActions.ts",
    `
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireClubAdminForClub } from "../auth/adminAccessGuards";
import { DEFAULT_FINANCE_PAGE_CONTENT } from "../financePage/financePageDefaults";
import { upsertClubFinancePageContent } from "../financePage/financePageService";
import { requireClubBySlug } from "../tenancy/tenantService";

const financePageSchema = z.object({
  introText: z.string().trim().min(1, "Intro skal udfyldes."),
  expenseEmail: z.string().trim().email("Bilagsmail skal være en gyldig email."),
  requiredInfoText: z.string().trim().min(1, "Oplysninger på bilag skal udfyldes."),
  approvalText: z.string().trim().min(1, "Godkendelsestekst skal udfyldes."),
  advanceText: z.string().trim().min(1, "Forskudstekst skal udfyldes."),
  payoutText: z.string().trim().min(1, "Udbetalingstekst skal udfyldes."),
});

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function updateFinancePageContentAction(
  clubSlug: string,
  formData: FormData,
) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(
    club.id,
    clubSlug,
    \`/\${clubSlug}/admin/oekonomi\`,
  );

  const parsed = financePageSchema.safeParse({
    introText: getText(formData, "introText"),
    expenseEmail: getText(formData, "expenseEmail"),
    requiredInfoText: getText(formData, "requiredInfoText"),
    approvalText: getText(formData, "approvalText"),
    advanceText: getText(formData, "advanceText"),
    payoutText: getText(formData, "payoutText"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ||
        "Der er ugyldige felter i formularen.",
    };
  }

  await upsertClubFinancePageContent(club.id, {
    ...DEFAULT_FINANCE_PAGE_CONTENT,
    ...parsed.data,
  });

  revalidatePath(\`/\${clubSlug}/admin/oekonomi\`);
  revalidatePath(\`/\${clubSlug}/om/oekonomi\`);
  revalidatePath(\`/\${clubSlug}/about\`);

  return { success: true };
}
`,
);

writeFile(
    "src/app/[clubSlug]/admin/oekonomi/page.tsx",
    `
import { notFound } from "next/navigation";
import AdminShell from "../../../../components/admin/AdminShell";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import { getClubFinancePageContent } from "../../../../lib/financePage/financePageService";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import FinancePageAdminForm from "./FinancePageAdminForm";

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
    \`/\${clubSlug}/admin/oekonomi\`,
  );

  const content = await getClubFinancePageContent(club.id);

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
            Økonomi
          </h1>
          <p className="max-w-3xl text-slate-400">
            Redigér information om udgiftsbilag, refusion, forskud og udbetaling.
          </p>
        </div>

        <FinancePageAdminForm
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
    "src/app/[clubSlug]/admin/oekonomi/FinancePageAdminForm.tsx",
    `
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
`,
);

writeFile(
    "src/app/[clubSlug]/om/oekonomi/page.tsx",
    `
import Link from "next/link";
import { resolvePublicPageForClub } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { getClubFinancePageContent } from "../../../../lib/financePage/financePageService";
import { publicRoutes } from "../../../../lib/publicRoutes";

interface FinancePageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function FinancePage({ params }: FinancePageProps) {
  const { clubSlug } = await params;
  const pageSlug = "oekonomi";

  const {
    club,
    theme,
    footerData,
    navigationItems,
    actionItems,
    publicSettings,
  } = await resolvePublicPageForClub(clubSlug, pageSlug);

  const content = await getClubFinancePageContent(club.id);

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
      title="Økonomi"
      subtitle="Information om udgiftsbilag, refusion, forskud og udbetaling."
      currentPath={publicRoutes.finance(clubSlug)}
      maxWidth="1120px"
    >
      <div className="mt-6 space-y-6">
        <ThemedSectionCard className="p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
                Udgiftsbilag
              </h2>

              <p className="mt-3 text-base font-normal leading-relaxed text-[var(--public-text)]">
                {content.introText}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-primary-soft)] p-4">
              <p className="text-sm font-semibold text-[var(--public-text-muted)]">
                Send bilag til
              </p>

              <a
                href={\`mailto:\${content.expenseEmail}\`}
                className="mt-2 block text-xl font-bold text-[var(--public-primary)]"
              >
                {content.expenseEmail}
              </a>
            </div>
          </div>
        </ThemedSectionCard>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ThemedSectionCard className="p-5 sm:p-6">
            <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
              På udgiftsbilaget skrives
            </h2>

            <p className="mt-4 text-base font-normal leading-relaxed text-[var(--public-text)]">
              {content.requiredInfoText}
            </p>

            <div className="mt-5 rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-4">
              <ul className="space-y-2 text-base font-normal text-[var(--public-text)]">
                <li>Navn</li>
                <li>MobilePay-nummer eller bankoplysninger</li>
                <li>Reg. nr.: Dit pengeinstituts registreringsnummer</li>
                <li>Konto nr.: Dit kontonummer</li>
              </ul>
            </div>
          </ThemedSectionCard>

          <ThemedSectionCard className="p-5 sm:p-6">
            <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
              Forhåndsgodkendelse
            </h2>

            <p className="mt-4 text-base font-normal leading-relaxed text-[var(--public-text)]">
              {content.approvalText}
            </p>
          </ThemedSectionCard>
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ThemedSectionCard className="p-5 sm:p-6">
            <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
              Forskud
            </h2>

            <p className="mt-4 text-base font-normal leading-relaxed text-[var(--public-text)]">
              {content.advanceText}
            </p>
          </ThemedSectionCard>

          <ThemedSectionCard className="p-5 sm:p-6">
            <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
              Udbetaling
            </h2>

            <p className="mt-4 text-base font-normal leading-relaxed text-[var(--public-text)]">
              {content.payoutText}
            </p>
          </ThemedSectionCard>
        </section>

        <ThemedSectionCard className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--public-text)]">
                Spørgsmål om økonomi?
              </h2>
              <p className="mt-2 text-base font-normal leading-relaxed text-[var(--public-text-muted)]">
                Kontakt kassereren eller en anden relevant kontaktperson.
              </p>
            </div>

            <Link href={publicRoutes.contact(clubSlug)} className="public-secondary-button">
              Se kontaktpersoner
            </Link>
          </div>
        </ThemedSectionCard>
      </div>
    </ThemedClubPageShell>
  );
}
`,
);

patchFile("src/lib/publicRoutes.ts", (current) => {
    if (current.includes("finance:")) return current;

    return current.replace(
        /membership:\s*\(clubSlug:\s*string\)\s*=>\s*`\/\$\{clubSlug\}\/om\/medlemsskab`,/,
        `membership: (clubSlug: string) => \`/\${clubSlug}/om/medlemsskab\`,
  finance: (clubSlug: string) => \`/\${clubSlug}/om/oekonomi\`,`,
    );
});

patchFile("src/components/admin/AdminSidebar.tsx", (current) => {
    if (current.includes("/admin/oekonomi")) return current;

    return current.replace(
        /<a\s+href={`\/\$\{clubSlug\}\/admin\/medlemsskab`}[\s\S]*?<\/a>/,
        (match) =>
            `${match}
          <a
            href={\`/\${clubSlug}/admin/oekonomi\`}
            className={\`admin-sidebar-item \${pathname?.startsWith(\`/\${clubSlug}/admin/oekonomi\`) ? "active" : ""}\`}
          >
            Økonomi
          </a>`,
    );
});

patchFile("src/app/[clubSlug]/about/page.tsx", (current) => {
    if (current.includes("href: publicRoutes.finance(clubSlug)")) return current;

    return current.replace(
        /{\s*title:\s*"Økonomi",\s*description:\s*"Kontingent, klubøkonomi og praktiske forhold\.",\s*icon:\s*"💰",\s*available:\s*false,\s*}/,
        `{
      title: "Økonomi",
      description: "Udgiftsbilag, refusion, forskud og praktiske økonomiforhold.",
      icon: "💰",
      href: publicRoutes.finance(clubSlug),
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