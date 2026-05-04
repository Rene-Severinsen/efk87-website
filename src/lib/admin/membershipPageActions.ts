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
  signupFee: z.string().trim().min(1, "Indmeldelsesgebyr skal udfyldes."),
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
    `/${clubSlug}/admin/medlemsskab`,
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

  revalidatePath(`/${clubSlug}/admin/medlemsskab`);
  revalidatePath(`/${clubSlug}/om/medlemsskab`);
  revalidatePath(`/${clubSlug}/about`);

  return { success: true };
}
