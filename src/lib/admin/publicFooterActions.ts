"use server";

import { revalidatePath } from "next/cache";
import prisma from "../db/prisma";
import { requireClubAdminForClub } from "../auth/adminAccessGuards";
import { requireClubBySlug } from "../tenancy/tenantService";

interface ActionResult {
  success: boolean;
  error?: string;
}

function cleanText(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function cleanUrl(value: FormDataEntryValue | null): string | null {
  const text = cleanText(value);

  if (!text) {
    return null;
  }

  if (
    text.startsWith("https://") ||
    text.startsWith("http://") ||
    text.startsWith("mailto:") ||
    text.startsWith("/")
  ) {
    return text;
  }

  return `https://${text}`;
}

function parseSortOrder(value: FormDataEntryValue | null, fallback: number): number {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function updatePublicFooterAction(
  clubSlug: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const club = await requireClubBySlug(clubSlug);

    await requireClubAdminForClub(
      club.id,
      clubSlug,
      `/${clubSlug}/admin/footer`,
    );

    const footerData = {
      description: cleanText(formData.get("description")),
      addressLine1: cleanText(formData.get("addressLine1")),
      addressLine2: cleanText(formData.get("addressLine2")),
      email: cleanText(formData.get("email")),
      phone: cleanText(formData.get("phone")),
      cvr: cleanText(formData.get("cvr")),
    };

    const sponsorIds = formData.getAll("sponsorId");
    const sponsorNames = formData.getAll("sponsorName");
    const sponsorHrefs = formData.getAll("sponsorHref");
    const sponsorLogoUrls = formData.getAll("sponsorLogoUrl");
    const sponsorLogoAltTexts = formData.getAll("sponsorLogoAltText");
    const sponsorSortOrders = formData.getAll("sponsorSortOrder");

    const rowCount = Math.max(
      sponsorIds.length,
      sponsorNames.length,
      sponsorHrefs.length,
      sponsorLogoUrls.length,
      sponsorLogoAltTexts.length,
      sponsorSortOrders.length,
    );

    const submittedSponsors: {
      id: string | null;
      name: string;
      href: string | null;
      logoUrl: string | null;
      logoAltText: string | null;
      sortOrder: number;
      isActive: boolean;
    }[] = [];

    for (let index = 0; index < rowCount; index += 1) {
      const name = cleanText(sponsorNames[index] ?? null);

      if (!name) {
        continue;
      }

      submittedSponsors.push({
        id: cleanText(sponsorIds[index] ?? null),
        name,
        href: cleanUrl(sponsorHrefs[index] ?? null),
        logoUrl: cleanUrl(sponsorLogoUrls[index] ?? null),
        logoAltText: cleanText(sponsorLogoAltTexts[index] ?? null),
        sortOrder: parseSortOrder(sponsorSortOrders[index] ?? null, (index + 1) * 10),
        isActive: formData.get(`sponsorActive-${index}`) === "on",
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.publicClubFooter.upsert({
        where: {
          clubId: club.id,
        },
        update: footerData,
        create: {
          clubId: club.id,
          ...footerData,
        },
      });

      const existingSponsors = await tx.publicSponsor.findMany({
        where: {
          clubId: club.id,
        },
        select: {
          id: true,
        },
      });

      const submittedExistingIds = new Set(
        submittedSponsors
          .map((sponsor) => sponsor.id)
          .filter((id): id is string => Boolean(id)),
      );

      const idsToDelete = existingSponsors
        .map((sponsor) => sponsor.id)
        .filter((id) => !submittedExistingIds.has(id));

      if (idsToDelete.length > 0) {
        await tx.publicSponsor.deleteMany({
          where: {
            clubId: club.id,
            id: {
              in: idsToDelete,
            },
          },
        });
      }

      for (const sponsor of submittedSponsors) {
        if (sponsor.id) {
          await tx.publicSponsor.updateMany({
            where: {
              id: sponsor.id,
              clubId: club.id,
            },
            data: {
              name: sponsor.name,
              href: sponsor.href,
              logoUrl: sponsor.logoUrl,
              logoAltText: sponsor.logoAltText,
              sortOrder: sponsor.sortOrder,
              isActive: sponsor.isActive,
            },
          });

          continue;
        }

        await tx.publicSponsor.create({
          data: {
            clubId: club.id,
            name: sponsor.name,
            href: sponsor.href,
            logoUrl: sponsor.logoUrl,
            logoAltText: sponsor.logoAltText,
            sortOrder: sponsor.sortOrder,
            isActive: sponsor.isActive,
          },
        });
      }
    });

    revalidatePath(`/${clubSlug}`);
    revalidatePath(`/${clubSlug}/admin/footer`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to update public footer", error);

    return {
      success: false,
      error: "Footer kunne ikke gemmes.",
    };
  }
}
