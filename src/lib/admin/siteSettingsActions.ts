
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireClubAdminForClub } from "@/lib/auth/adminAccessGuards";
import { updateClubWeatherSettings } from "./siteSettingsService";

const weatherSettingsSchema = z.object({
  latitude: z.union([
    z.number().min(-90).max(90),
    z.null(),
    z.undefined(),
    z.literal("")
  ]).transform(val => (val === "" ? null : val)),
  longitude: z.union([
    z.number().min(-180).max(180),
    z.null(),
    z.undefined(),
    z.literal("")
  ]).transform(val => (val === "" ? null : val)),
});

export async function updateWeatherSettingsAction(
  clubId: string,
  clubSlug: string,
  formData: FormData
) {
  await requireClubAdminForClub(clubId, clubSlug, `/${clubSlug}/admin/site-settings`);

  const rawLat = formData.get("latitude");
  const rawLon = formData.get("longitude");

  const parsed = weatherSettingsSchema.safeParse({
    latitude: rawLat ? parseFloat(rawLat as string) : null,
    longitude: rawLon ? parseFloat(rawLon as string) : null,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Ugyldige koordinater. Latitude skal være mellem -90 og 90, og longitude mellem -180 og 180."
    };
  }

  try {
    await updateClubWeatherSettings(clubId, parsed.data.latitude ?? null, parsed.data.longitude ?? null);
    revalidatePath(`/${clubSlug}/admin/site-settings`);
    revalidatePath(`/${clubSlug}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update weather settings", error);
    return { success: false, error: "Der skete en fejl ved gemning af indstillinger." };
  }
}
