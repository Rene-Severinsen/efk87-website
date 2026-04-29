"use server";

import prisma from "../db/prisma";
import { getServerViewerForClub } from "@/lib/auth/viewer";
import { revalidatePath } from "next/cache";

export type ProfileActionResponse = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function updateOwnMemberProfileAction(
  clubId: string,
  clubSlug: string,
  prevState: ProfileActionResponse | null,
  formData: FormData
): Promise<ProfileActionResponse> {
  // 1. Authenticate and authorize
  const viewer = await getServerViewerForClub(clubId);
  if (!viewer.isAuthenticated || !viewer.userId) {
    return { error: "Du skal være logget ind for at opdatere din profil." };
  }

  // 2. Extract and sanitize inputs
  const getString = (key: string, maxLength: number = 255) => {
    const val = formData.get(key) as string | null;
    if (val === null) return null;
    const trimmed = val.trim();
    if (trimmed === "") return null;
    return trimmed.substring(0, maxLength);
  };

  const getDate = (key: string) => {
    const val = formData.get(key) as string | null;
    if (!val) return null;
    const date = new Date(val);
    return isNaN(date.getTime()) ? null : date;
  };

  const firstName = getString("firstName");
  const lastName = getString("lastName");
  const mobilePhone = getString("mobilePhone");
  const addressLine = getString("addressLine");
  const postalCode = getString("postalCode", 20);
  const city = getString("city");
  const mdkNumber = getString("mdkNumber", 50);
  const birthDate = getDate("birthDate");

  // 3. Simple validation
  const fieldErrors: Record<string, string> = {};
  if (!firstName) fieldErrors.firstName = "Fornavn er påkrævet";
  if (!lastName) fieldErrors.lastName = "Efternavn er påkrævet";

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  try {
    // 4. Update ONLY the current user's profile for the current club
    await prisma.clubMemberProfile.update({
      where: {
        clubId_userId: {
          clubId: clubId,
          userId: viewer.userId,
        },
      },
      data: {
        firstName,
        lastName,
        mobilePhone,
        addressLine,
        postalCode,
        city,
        mdkNumber,
        birthDate,
      },
    });

    // 5. Revalidate relevant paths
    revalidatePath(`/${clubSlug}/profil`);
    // Also revalidate admin paths to ensure data consistency
    revalidatePath(`/${clubSlug}/admin/medlemmer`);
    revalidatePath(`/${clubSlug}/admin/medlemmer/${viewer.userId}/rediger`);

    return { success: true };
  } catch (err) {
    console.error("Failed to update profile:", err);
    return { error: "Der skete en fejl ved opdatering af profilen. Prøv venligst igen." };
  }
}
