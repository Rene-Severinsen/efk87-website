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
    signupFee: fee.signupFee.trim(),
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
            signupFee: fee.signupFee,
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
    .filter((fee) => fee.title && fee.price && fee.signupFee && fee.period);

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
          signupFee: fee.signupFee,
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
