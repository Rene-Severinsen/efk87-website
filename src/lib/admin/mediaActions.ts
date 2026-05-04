"use server";

import { revalidatePath } from "next/cache";
import { requireClubAdminForClub } from "../auth/adminAccessGuards";
import {
  deactivateClubMediaAsset,
  uploadClubMediaAsset,
} from "../media/mediaStorageService";
import { requireClubBySlug } from "../tenancy/tenantService";

function getText(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  return typeof value === "string" ? value : null;
}

export async function uploadClubMediaAction(
  clubSlug: string,
  formData: FormData,
) {
  const club = await requireClubBySlug(clubSlug);
  const viewer = await requireClubAdminForClub(
    club.id,
    clubSlug,
    `/${clubSlug}/admin/media`,
  );

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return {
      success: false,
      error: "Vælg et billede der skal uploades.",
    };
  }

  try {
    await uploadClubMediaAsset({
      clubId: club.id,
      clubSlug,
      file,
      title: getText(formData, "title"),
      altText: getText(formData, "altText"),
      uploadedByName: viewer.name || null,
      uploadedByEmail: viewer.email || null,
    });

    revalidatePath(`/${clubSlug}/admin/media`);

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Billedet kunne ikke uploades.",
    };
  }
}

export async function deactivateClubMediaAction(
  clubSlug: string,
  assetId: string,
) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(
    club.id,
    clubSlug,
    `/${clubSlug}/admin/media`,
  );

  await deactivateClubMediaAsset(club.id, assetId);

  revalidatePath(`/${clubSlug}/admin/media`);

  return {
    success: true,
  };
}
