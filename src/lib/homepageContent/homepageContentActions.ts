"use server";

import { revalidatePath } from "next/cache";
import prisma from "../db/prisma";
import { getServerViewerForClub } from "../auth/viewer";
import { requireClubBySlug } from "../tenancy/tenantService";
import { requireActiveMemberForClub } from "../auth/accessGuards";
import { requireClubAdminForClub } from "../auth/adminAccessGuards";
import { HomepageContentSignupMode, HomepageContentVisibility } from "../../generated/prisma";

/**
 * Registrerer en bruger til et opslag på forsiden.
 */
export async function registerForHomepageContentAction(
  clubSlug: string,
  contentId: string,
  formData: FormData
) {
  const club = await requireClubBySlug(clubSlug);
  const viewer = await getServerViewerForClub(club.id);

  if (!viewer.isAuthenticated || !viewer.userId) {
    throw new Error("Du skal være logget ind for at tilmelde dig");
  }

  // Sørg for at brugeren er et aktivt medlem (kun medlemmer kan tilmelde sig)
  await requireActiveMemberForClub(club.id, clubSlug);

  const content = await prisma.homepageContent.findFirst({
    where: { id: contentId, clubId: club.id }
  });

  if (!content) {
    throw new Error("Opslaget blev ikke fundet");
  }

  if (!content.isActive) {
    throw new Error("Opslaget er ikke længere aktivt");
  }

  if (content.signupMode === HomepageContentSignupMode.NONE) {
    throw new Error("Tilmelding er ikke mulig for dette opslag");
  }

  let quantity = 1;
  if (content.signupMode === HomepageContentSignupMode.QUANTITY) {
    const qtyValue = formData.get("quantity");
    quantity = parseInt(qtyValue as string, 10);
    if (isNaN(quantity) || quantity < 1) {
      throw new Error("Antal skal være mindst 1");
    }
  }

  const note = formData.get("note") as string || null;

  // Find eksisterende tilmelding (også aflyste)
  const existingSignup = await prisma.homepageContentSignup.findUnique({
    where: {
      contentId_userId: {
        contentId,
        userId: viewer.userId
      }
    }
  });

  if (existingSignup) {
    // Hvis der findes en aktiv tilmelding, opdaterer vi den (især relevant for QUANTITY)
    if (!existingSignup.cancelledAt) {
       await prisma.homepageContentSignup.update({
        where: { id: existingSignup.id },
        data: {
          quantity,
          note,
          updatedAt: new Date()
        }
      });
    } else {
      // Hvis den var aflyst, genaktiverer vi den
      await prisma.homepageContentSignup.update({
        where: { id: existingSignup.id },
        data: {
          quantity,
          note,
          cancelledAt: null,
          cancelledByUserId: null,
          updatedAt: new Date()
        }
      });
    }
  } else {
    // Opret ny tilmelding
    await prisma.homepageContentSignup.create({
      data: {
        clubId: club.id,
        contentId,
        userId: viewer.userId,
        quantity,
        note
      }
    });
  }

  revalidatePath(`/${clubSlug}`);
}

/**
 * Aflyser en brugers egen tilmelding.
 */
export async function cancelOwnHomepageContentSignupAction(
  clubSlug: string,
  contentId: string
) {
  const club = await requireClubBySlug(clubSlug);
  const viewer = await getServerViewerForClub(club.id);

  if (!viewer.isAuthenticated || !viewer.userId) {
    throw new Error("Du skal være logget ind for at afmelde dig");
  }

  const signup = await prisma.homepageContentSignup.findUnique({
    where: {
      contentId_userId: {
        contentId,
        userId: viewer.userId
      }
    }
  });

  if (!signup || signup.clubId !== club.id) {
    throw new Error("Tilmeldingen blev ikke fundet");
  }

  if (signup.cancelledAt) {
    return; // Allerede aflyst
  }

  await prisma.homepageContentSignup.update({
    where: { id: signup.id },
    data: {
      cancelledAt: new Date(),
      cancelledByUserId: viewer.userId
    }
  });

  revalidatePath(`/${clubSlug}`);
}

/**
 * Admin aflyser en tilmelding.
 */
export async function adminCancelHomepageContentSignupAction(
  clubSlug: string,
  signupId: string
) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug);
  const viewer = await getServerViewerForClub(club.id);

  const signup = await prisma.homepageContentSignup.findUnique({
    where: { id: signupId },
    include: { content: true }
  });

  if (!signup || signup.content.clubId !== club.id) {
    throw new Error("Tilmeldingen blev ikke fundet");
  }

  await prisma.homepageContentSignup.update({
    where: { id: signupId },
    data: {
      cancelledAt: new Date(),
      cancelledByUserId: viewer.userId
    }
  });

  revalidatePath(`/${clubSlug}/admin/forside-indhold/${signup.contentId}/tilmeldinger`);
  revalidatePath(`/${clubSlug}`);
}

/**
 * Opretter eller opdaterer opslag (Admin).
 */
export async function saveHomepageContentAction(
  clubSlug: string,
  contentId: string | null,
  data: {
    title: string;
    bodyHtml: string;
    isActive: boolean;
    visibility: HomepageContentVisibility;
    visibleFrom: Date | null;
    visibleUntil: Date | null;
    sortOrder: number;
    signupMode: HomepageContentSignupMode;
    signupLabel: string | null;
  }
) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug);

  if (data.visibleFrom && data.visibleUntil && data.visibleUntil < data.visibleFrom) {
    throw new Error("Slutdato skal være efter startdato");
  }

  if (contentId) {
    await prisma.homepageContent.update({
      where: { id: contentId, clubId: club.id },
      data
    });
  } else {
    await prisma.homepageContent.create({
      data: {
        ...data,
        clubId: club.id
      }
    });
  }

  revalidatePath(`/${clubSlug}/admin/forside-indhold`);
  revalidatePath(`/${clubSlug}`);
}

/**
 * Sletter et opslag (Admin).
 */
export async function deleteHomepageContentAction(
  clubSlug: string,
  contentId: string
) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug);

  await prisma.homepageContent.delete({
    where: { id: contentId, clubId: club.id }
  });

  revalidatePath(`/${clubSlug}/admin/forside-indhold`);
  revalidatePath(`/${clubSlug}`);
}

/**
 * Opdaterer sortOrder for et opslag (Admin).
 */
export async function updateHomepageContentSortOrderAction(
  clubSlug: string,
  contentId: string,
  newSortOrder: number
) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug);

  await prisma.homepageContent.update({
    where: { id: contentId, clubId: club.id },
    data: { sortOrder: newSortOrder }
  });

  revalidatePath(`/${clubSlug}/admin/forside-indhold`);
  revalidatePath(`/${clubSlug}`);
}
