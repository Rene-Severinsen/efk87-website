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
