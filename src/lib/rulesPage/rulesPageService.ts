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
