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
    `/${clubSlug}/admin/oekonomi`,
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

  revalidatePath(`/${clubSlug}/admin/oekonomi`);
  revalidatePath(`/${clubSlug}/om/oekonomi`);
  revalidatePath(`/${clubSlug}/about`);

  return { success: true };
}
