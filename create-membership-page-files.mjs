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

    if (!next.includes("membershipPage ClubMembershipPage?")) {
        next = next.replace(
            /(model Club\s*{[\s\S]*?)(\n\s*rulesPage\s+ClubRulesPage\?)/,
            `$1
  membershipPage ClubMembershipPage?$2`,
        );
    }

    if (!next.includes("model ClubMembershipPage")) {
        next += `

model ClubMembershipPage {
  id     String @id @default(cuid())
  clubId String @unique

  introText       String @db.Text
  processIntro    String @db.Text
  stepOneTitle    String
  stepOneText     String @db.Text
  stepTwoTitle    String
  stepTwoText     String @db.Text
  stepThreeTitle  String
  stepThreeText   String @db.Text
  paymentText     String @db.Text
  practicalText   String @db.Text
  ctaLabel        String
  contactCtaLabel String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  club Club @relation(fields: [clubId], references: [id])
  fees ClubMembershipFee[]
}

model ClubMembershipFee {
  id String @id @default(cuid())

  clubMembershipPageId String
  title       String
  price       String
  period      String
  description String @db.Text
  sortOrder   Int    @default(0)
  isActive    Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  membershipPage ClubMembershipPage @relation(fields: [clubMembershipPageId], references: [id], onDelete: Cascade)

  @@index([clubMembershipPageId, sortOrder])
}
`;
    }

    return next;
});

writeFile(
    "src/lib/membershipPage/membershipPageDefaults.ts",
    `
export interface MembershipFeeContent {
  id?: string;
  title: string;
  price: string;
  period: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ClubMembershipPageContent {
  introText: string;
  processIntro: string;
  stepOneTitle: string;
  stepOneText: string;
  stepTwoTitle: string;
  stepTwoText: string;
  stepThreeTitle: string;
  stepThreeText: string;
  paymentText: string;
  practicalText: string;
  ctaLabel: string;
  contactCtaLabel: string;
  fees: MembershipFeeContent[];
}

export const DEFAULT_MEMBERSHIP_PAGE_CONTENT: ClubMembershipPageContent = {
  introText:
    "Her finder du information om medlemskab, indmeldelse, kontingenter og opkrævning.",
  processIntro:
    "Indmeldelse sker selvbetjent via klubbens indmeldelsesformular. Når den fremsendte faktura er betalt, aktiveres medlemskabet automatisk.",
  stepOneTitle: "Udfyld indmeldelsesformularen",
  stepOneText:
    "Vælg medlemstype og indtast dine oplysninger i formularen.",
  stepTwoTitle: "Betal den fremsendte faktura",
  stepTwoText:
    "Når formularen er sendt, modtager du en faktura/opkrævning med betalingsoplysninger.",
  stepThreeTitle: "Medlemskabet aktiveres",
  stepThreeText:
    "Når betalingen er registreret, aktiveres medlemskabet automatisk.",
  paymentText:
    "Efter indmeldelse fremsendes faktura. Betaling skal ske med korrekt betalingsreference. Medlemsnummer bruges som reference, når det fremgår af opkrævningen. Medlemskabet er først aktivt, når betalingen er registreret.",
  practicalText:
    "Har du spørgsmål om kontingent og betaling, kan du kontakte kassereren. Har du spørgsmål om skoleflyvning eller praktisk opstart, kan du kontakte klubbens instruktører.",
  ctaLabel: "Meld dig ind",
  contactCtaLabel: "Se kontaktpersoner",
  fees: [
    {
      title: "Senior",
      price: "Udfyld pris",
      period: "pr. år",
      description: "For medlemmer fra og med det år, man fylder 18.",
      sortOrder: 10,
      isActive: true,
    },
    {
      title: "Junior",
      price: "Udfyld pris",
      period: "pr. år",
      description: "For medlemmer under 18 år.",
      sortOrder: 20,
      isActive: true,
    },
    {
      title: "Passiv",
      price: "Udfyld pris",
      period: "pr. år",
      description: "For passive medlemmer uden aktiv flyveret.",
      sortOrder: 30,
      isActive: true,
    },
  ],
};
`,
);

writeFile(
    "src/lib/membershipPage/membershipPageService.ts",
    `
import prisma from "../db/prisma";
import {
  ClubMembershipPageContent,
  DEFAULT_MEMBERSHIP_PAGE_CONTENT,
  MembershipFeeContent,
} from "./membershipPageDefaults";

function normalizeText(value: string | null, fallback: string): string {
  const trimmed = value?.trim();

  return trimmed || fallback;
}

function normalizeFee(fee: MembershipFeeContent, index: number): MembershipFeeContent {
  return {
    id: fee.id,
    title: fee.title.trim(),
    price: fee.price.trim(),
    period: fee.period.trim(),
    description: fee.description.trim(),
    sortOrder: Number.isFinite(fee.sortOrder) ? fee.sortOrder : index * 10,
    isActive: fee.isActive,
  };
}

export async function getClubMembershipPageContent(
  clubId: string,
): Promise<ClubMembershipPageContent> {
  const membershipPage = await prisma.clubMembershipPage.findUnique({
    where: { clubId },
    include: {
      fees: {
        orderBy: [
          { sortOrder: "asc" },
          { title: "asc" },
        ],
      },
    },
  });

  if (!membershipPage) {
    return DEFAULT_MEMBERSHIP_PAGE_CONTENT;
  }

  return {
    introText: normalizeText(membershipPage.introText, DEFAULT_MEMBERSHIP_PAGE_CONTENT.introText),
    processIntro: normalizeText(membershipPage.processIntro, DEFAULT_MEMBERSHIP_PAGE_CONTENT.processIntro),
    stepOneTitle: normalizeText(membershipPage.stepOneTitle, DEFAULT_MEMBERSHIP_PAGE_CONTENT.stepOneTitle),
    stepOneText: normalizeText(membershipPage.stepOneText, DEFAULT_MEMBERSHIP_PAGE_CONTENT.stepOneText),
    stepTwoTitle: normalizeText(membershipPage.stepTwoTitle, DEFAULT_MEMBERSHIP_PAGE_CONTENT.stepTwoTitle),
    stepTwoText: normalizeText(membershipPage.stepTwoText, DEFAULT_MEMBERSHIP_PAGE_CONTENT.stepTwoText),
    stepThreeTitle: normalizeText(membershipPage.stepThreeTitle, DEFAULT_MEMBERSHIP_PAGE_CONTENT.stepThreeTitle),
    stepThreeText: normalizeText(membershipPage.stepThreeText, DEFAULT_MEMBERSHIP_PAGE_CONTENT.stepThreeText),
    paymentText: normalizeText(membershipPage.paymentText, DEFAULT_MEMBERSHIP_PAGE_CONTENT.paymentText),
    practicalText: normalizeText(membershipPage.practicalText, DEFAULT_MEMBERSHIP_PAGE_CONTENT.practicalText),
    ctaLabel: normalizeText(membershipPage.ctaLabel, DEFAULT_MEMBERSHIP_PAGE_CONTENT.ctaLabel),
    contactCtaLabel: normalizeText(membershipPage.contactCtaLabel, DEFAULT_MEMBERSHIP_PAGE_CONTENT.contactCtaLabel),
    fees:
      membershipPage.fees.length > 0
        ? membershipPage.fees.map((fee) => ({
            id: fee.id,
            title: fee.title,
            price: fee.price,
            period: fee.period,
            description: fee.description,
            sortOrder: fee.sortOrder,
            isActive: fee.isActive,
          }))
        : DEFAULT_MEMBERSHIP_PAGE_CONTENT.fees,
  };
}

export async function upsertClubMembershipPageContent(
  clubId: string,
  content: ClubMembershipPageContent,
) {
  const normalizedFees = content.fees
    .map(normalizeFee)
    .filter((fee) => fee.title && fee.price && fee.period);

  return prisma.$transaction(async (tx) => {
    const membershipPage = await tx.clubMembershipPage.upsert({
      where: { clubId },
      create: {
        clubId,
        introText: content.introText,
        processIntro: content.processIntro,
        stepOneTitle: content.stepOneTitle,
        stepOneText: content.stepOneText,
        stepTwoTitle: content.stepTwoTitle,
        stepTwoText: content.stepTwoText,
        stepThreeTitle: content.stepThreeTitle,
        stepThreeText: content.stepThreeText,
        paymentText: content.paymentText,
        practicalText: content.practicalText,
        ctaLabel: content.ctaLabel,
        contactCtaLabel: content.contactCtaLabel,
      },
      update: {
        introText: content.introText,
        processIntro: content.processIntro,
        stepOneTitle: content.stepOneTitle,
        stepOneText: content.stepOneText,
        stepTwoTitle: content.stepTwoTitle,
        stepTwoText: content.stepTwoText,
        stepThreeTitle: content.stepThreeTitle,
        stepThreeText: content.stepThreeText,
        paymentText: content.paymentText,
        practicalText: content.practicalText,
        ctaLabel: content.ctaLabel,
        contactCtaLabel: content.contactCtaLabel,
      },
    });

    await tx.clubMembershipFee.deleteMany({
      where: {
        clubMembershipPageId: membershipPage.id,
      },
    });

    if (normalizedFees.length > 0) {
      await tx.clubMembershipFee.createMany({
        data: normalizedFees.map((fee, index) => ({
          clubMembershipPageId: membershipPage.id,
          title: fee.title,
          price: fee.price,
          period: fee.period,
          description: fee.description,
          sortOrder: fee.sortOrder || index * 10,
          isActive: fee.isActive,
        })),
      });
    }

    return membershipPage;
  });
}
`,
);

writeFile(
    "src/lib/admin/membershipPageActions.ts",
    `
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireClubAdminForClub } from "../auth/adminAccessGuards";
import { DEFAULT_MEMBERSHIP_PAGE_CONTENT } from "../membershipPage/membershipPageDefaults";
import { upsertClubMembershipPageContent } from "../membershipPage/membershipPageService";
import { requireClubBySlug } from "../tenancy/tenantService";

const feeSchema = z.object({
  title: z.string().trim().min(1, "Kontingentnavn skal udfyldes."),
  price: z.string().trim().min(1, "Pris skal udfyldes."),
  period: z.string().trim().min(1, "Periode skal udfyldes."),
  description: z.string().trim().min(1, "Beskrivelse skal udfyldes."),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean(),
});

const membershipPageSchema = z.object({
  introText: z.string().trim().min(1, "Intro skal udfyldes."),
  processIntro: z.string().trim().min(1, "Procesintro skal udfyldes."),
  stepOneTitle: z.string().trim().min(1, "Trin 1 titel skal udfyldes."),
  stepOneText: z.string().trim().min(1, "Trin 1 tekst skal udfyldes."),
  stepTwoTitle: z.string().trim().min(1, "Trin 2 titel skal udfyldes."),
  stepTwoText: z.string().trim().min(1, "Trin 2 tekst skal udfyldes."),
  stepThreeTitle: z.string().trim().min(1, "Trin 3 titel skal udfyldes."),
  stepThreeText: z.string().trim().min(1, "Trin 3 tekst skal udfyldes."),
  paymentText: z.string().trim().min(1, "Opkrævningstekst skal udfyldes."),
  practicalText: z.string().trim().min(1, "Praktisk tekst skal udfyldes."),
  ctaLabel: z.string().trim().min(1, "CTA-label skal udfyldes."),
  contactCtaLabel: z.string().trim().min(1, "Kontakt CTA-label skal udfyldes."),
  feesJson: z.string().trim().min(1, "Kontingenter mangler."),
});

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function updateMembershipPageContentAction(
  clubSlug: string,
  formData: FormData,
) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(
    club.id,
    clubSlug,
    \`/\${clubSlug}/admin/medlemsskab\`,
  );

  const parsed = membershipPageSchema.safeParse({
    introText: getText(formData, "introText"),
    processIntro: getText(formData, "processIntro"),
    stepOneTitle: getText(formData, "stepOneTitle"),
    stepOneText: getText(formData, "stepOneText"),
    stepTwoTitle: getText(formData, "stepTwoTitle"),
    stepTwoText: getText(formData, "stepTwoText"),
    stepThreeTitle: getText(formData, "stepThreeTitle"),
    stepThreeText: getText(formData, "stepThreeText"),
    paymentText: getText(formData, "paymentText"),
    practicalText: getText(formData, "practicalText"),
    ctaLabel: getText(formData, "ctaLabel"),
    contactCtaLabel: getText(formData, "contactCtaLabel"),
    feesJson: getText(formData, "feesJson"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ||
        "Der er ugyldige felter i formularen.",
    };
  }

  let rawFees: unknown;

  try {
    rawFees = JSON.parse(parsed.data.feesJson);
  } catch {
    return {
      success: false,
      error: "Kontingenter kunne ikke læses.",
    };
  }

  const feesParsed = z.array(feeSchema).safeParse(rawFees);

  if (!feesParsed.success) {
    return {
      success: false,
      error:
        feesParsed.error.issues[0]?.message ||
        "Der er ugyldige kontingentfelter.",
    };
  }

  await upsertClubMembershipPageContent(club.id, {
    ...DEFAULT_MEMBERSHIP_PAGE_CONTENT,
    introText: parsed.data.introText,
    processIntro: parsed.data.processIntro,
    stepOneTitle: parsed.data.stepOneTitle,
    stepOneText: parsed.data.stepOneText,
    stepTwoTitle: parsed.data.stepTwoTitle,
    stepTwoText: parsed.data.stepTwoText,
    stepThreeTitle: parsed.data.stepThreeTitle,
    stepThreeText: parsed.data.stepThreeText,
    paymentText: parsed.data.paymentText,
    practicalText: parsed.data.practicalText,
    ctaLabel: parsed.data.ctaLabel,
    contactCtaLabel: parsed.data.contactCtaLabel,
    fees: feesParsed.data,
  });

  revalidatePath(\`/\${clubSlug}/admin/medlemsskab\`);
  revalidatePath(\`/\${clubSlug}/om/medlemsskab\`);
  revalidatePath(\`/\${clubSlug}/about\`);

  return { success: true };
}
`,
);

writeFile(
    "src/app/[clubSlug]/admin/medlemsskab/page.tsx",
    `
import { notFound } from "next/navigation";
import AdminShell from "../../../../components/admin/AdminShell";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import { getClubMembershipPageContent } from "../../../../lib/membershipPage/membershipPageService";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import MembershipPageAdminForm from "./MembershipPageAdminForm";

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
    \`/\${clubSlug}/admin/medlemsskab\`,
  );

  const content = await getClubMembershipPageContent(club.id);

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
            Medlemsskab
          </h1>
          <p className="max-w-3xl text-slate-400">
            Redigér indmeldelsesprocedure, kontingenter, opkrævning og praktisk medlemsinformation.
          </p>
        </div>

        <MembershipPageAdminForm
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
    "src/app/[clubSlug]/admin/medlemsskab/MembershipPageAdminForm.tsx",
    `
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

        <div className="space-y-5">
          {fees.map((fee, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
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

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
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

              <div className="mt-4 space-y-2">
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
`,
);

writeFile(
    "src/app/[clubSlug]/om/medlemsskab/page.tsx",
    `
import Link from "next/link";
import { resolvePublicPageForClub } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { getClubMembershipPageContent } from "../../../../lib/membershipPage/membershipPageService";
import { publicRoutes } from "../../../../lib/publicRoutes";

interface MembershipPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

function getParagraphs(text: string): string[] {
  return text
    .split(/\\n\\s*\\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default async function MembershipPage({ params }: MembershipPageProps) {
  const { clubSlug } = await params;
  const pageSlug = "medlemsskab";

  const {
    club,
    theme,
    footerData,
    navigationItems,
    actionItems,
    publicSettings,
  } = await resolvePublicPageForClub(clubSlug, pageSlug);

  const content = await getClubMembershipPageContent(club.id);
  const activeFees = content.fees.filter((fee) => fee.isActive);

  const steps = [
    {
      number: "1",
      title: content.stepOneTitle,
      text: content.stepOneText,
    },
    {
      number: "2",
      title: content.stepTwoTitle,
      text: content.stepTwoText,
    },
    {
      number: "3",
      title: content.stepThreeTitle,
      text: content.stepThreeText,
    },
  ];

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
      title="Medlemsskab"
      subtitle="Information om indmeldelse, kontingenter, opkrævning og praktiske forhold."
      currentPath={publicRoutes.membership(clubSlug)}
      maxWidth="1120px"
    >
      <div className="mt-6 space-y-6">
        <ThemedSectionCard className="p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
                Sådan bliver du medlem
              </h2>

              <p className="mt-3 text-base font-normal leading-relaxed text-[var(--public-text)]">
                {content.introText}
              </p>

              <p className="mt-3 text-base font-normal leading-relaxed text-[var(--public-text-muted)]">
                {content.processIntro}
              </p>
            </div>

            <div className="flex items-start lg:justify-end">
              <Link href={publicRoutes.becomeMember(clubSlug)} className="public-primary-button">
                {content.ctaLabel}
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-5"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--public-primary-soft)] text-sm font-bold text-[var(--public-primary)]">
                  {step.number}
                </div>

                <h3 className="text-lg font-bold text-[var(--public-text)]">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm font-normal leading-relaxed text-[var(--public-text-muted)] sm:text-base">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </ThemedSectionCard>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
              Kontingenter
            </h2>
          </div>

          {activeFees.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {activeFees.map((fee) => (
                <ThemedSectionCard key={fee.title} className="flex h-full flex-col p-5 sm:p-6">
                  <h3 className="text-xl font-bold text-[var(--public-text)]">
                    {fee.title}
                  </h3>

                  <div className="mt-4">
                    <span className="text-3xl font-bold text-[var(--public-primary)]">
                      {fee.price}
                    </span>
                    <span className="ml-2 text-sm font-normal text-[var(--public-text-muted)]">
                      {fee.period}
                    </span>
                  </div>

                  <p className="mt-4 text-base font-normal leading-relaxed text-[var(--public-text)]">
                    {fee.description}
                  </p>
                </ThemedSectionCard>
              ))}
            </div>
          ) : (
            <ThemedSectionCard className="p-5 sm:p-6">
              <p className="text-base font-normal text-[var(--public-text-muted)]">
                Kontingenter er endnu ikke oprettet.
              </p>
            </ThemedSectionCard>
          )}
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ThemedSectionCard className="p-5 sm:p-6">
            <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
              Opkrævning og betaling
            </h2>

            <div className="mt-4 space-y-4 text-base font-normal leading-relaxed text-[var(--public-text)]">
              {getParagraphs(content.paymentText).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </ThemedSectionCard>

          <ThemedSectionCard className="p-5 sm:p-6">
            <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
              Praktisk information
            </h2>

            <div className="mt-4 space-y-4 text-base font-normal leading-relaxed text-[var(--public-text)]">
              {getParagraphs(content.practicalText).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-6">
              <Link href={publicRoutes.contact(clubSlug)} className="public-secondary-button">
                {content.contactCtaLabel}
              </Link>
            </div>
          </ThemedSectionCard>
        </section>
      </div>
    </ThemedClubPageShell>
  );
}
`,
);

patchFile("src/lib/publicRoutes.ts", (current) => {
    if (current.includes("membership:")) return current;

    return current.replace(
        /rules:\s*\(clubSlug:\s*string\)\s*=>\s*`\/\$\{clubSlug\}\/om\/regler-og-bestemmelser`,/,
        `rules: (clubSlug: string) => \`/\${clubSlug}/om/regler-og-bestemmelser\`,
  membership: (clubSlug: string) => \`/\${clubSlug}/om/medlemsskab\`,`,
    );
});

patchFile("src/components/admin/AdminSidebar.tsx", (current) => {
    if (current.includes("/admin/medlemsskab")) return current;

    return current.replace(
        /<a\s+href={`\/\$\{clubSlug\}\/admin\/regler-og-bestemmelser`}[\s\S]*?<\/a>/,
        (match) =>
            `${match}
          <a
            href={\`/\${clubSlug}/admin/medlemsskab\`}
            className={\`admin-sidebar-item \${pathname?.startsWith(\`/\${clubSlug}/admin/medlemsskab\`) ? "active" : ""}\`}
          >
            Medlemsskab
          </a>`,
    );
});

patchFile("src/app/[clubSlug]/about/page.tsx", (current) => {
    if (current.includes("href: publicRoutes.membership(clubSlug)")) return current;

    const membershipTile = `    {
      title: "Medlemsskab",
      description: "Læs om indmeldelse, kontingenter og opkrævning.",
      icon: "🪪",
      href: publicRoutes.membership(clubSlug),
      available: true,
    },
`;

    return current.replace(
        /(const tiles: AboutTile\[\] = \[\n)/,
        `$1${membershipTile}`,
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