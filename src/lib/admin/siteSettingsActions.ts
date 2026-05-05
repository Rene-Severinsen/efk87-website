
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireClubAdminForClub } from "@/lib/auth/adminAccessGuards";
import { updateClubWeatherSettings, updateClubPublicTheme, updatePublicHomepageSettings } from "./siteSettingsService";

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

const publicThemeSchema = z.object({
  publicThemeMode: z.enum(["light", "dark"]),
});

export async function updatePublicThemeAction(
  clubId: string,
  clubSlug: string,
  formData: FormData
) {
  await requireClubAdminForClub(clubId, clubSlug, `/${clubSlug}/admin/site-settings`);

  const rawTheme = formData.get("publicThemeMode");

  const parsed = publicThemeSchema.safeParse({
    publicThemeMode: rawTheme,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Ugyldigt tema valgt."
    };
  }

  try {
    await updateClubPublicTheme(clubId, parsed.data.publicThemeMode);
    revalidatePath(`/${clubSlug}/admin/site-settings`);
    revalidatePath(`/${clubSlug}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to update public theme settings", error);
    return { success: false, error: "Der skete en fejl ved gemning af tema-indstillinger." };
  }
}


const publicHomepageSettingsSchema = z.object({
  publicHeroTitle: z.string().trim().optional(),
  publicHeroSubtitle: z.string().trim().optional(),
  publicHeroPrimaryCtaLabel: z.string().trim().optional(),
  publicHeroPrimaryCtaHref: z.string().trim().optional(),
  publicHeroSecondaryCtaLabel: z.string().trim().optional(),
  publicHeroSecondaryCtaHref: z.string().trim().optional(),
  publicHeroTertiaryCtaLabel: z.string().trim().optional(),
  publicHeroTertiaryCtaHref: z.string().trim().optional(),
  publicHeroQuaternaryCtaLabel: z.string().trim().optional(),
  publicHeroQuaternaryCtaHref: z.string().trim().optional(),
  publicIntroTitle: z.string().trim().optional(),
  publicIntroLinkLabel: z.string().trim().optional(),
  publicIntroLinkHref: z.string().trim().optional(),
  publicIntroCard1Icon: z.string().trim().optional(),
  publicIntroCard1Title: z.string().trim().optional(),
  publicIntroCard1Text: z.string().trim().optional(),
  publicIntroCard1Href: z.string().trim().optional(),
  publicIntroCard2Icon: z.string().trim().optional(),
  publicIntroCard2Title: z.string().trim().optional(),
  publicIntroCard2Text: z.string().trim().optional(),
  publicIntroCard2Href: z.string().trim().optional(),
  publicIntroCard3Icon: z.string().trim().optional(),
  publicIntroCard3Title: z.string().trim().optional(),
  publicIntroCard3Text: z.string().trim().optional(),
  publicIntroCard3Href: z.string().trim().optional(),
  publicCtaSectionTitle: z.string().trim().optional(),
  publicCtaSectionLinkLabel: z.string().trim().optional(),
  publicCtaSectionLinkHref: z.string().trim().optional(),
  publicCtaBoxIcon: z.string().trim().optional(),
  publicCtaBoxTitle: z.string().trim().optional(),
  publicCtaBoxText: z.string().trim().optional(),
  publicCtaPrimaryLabel: z.string().trim().optional(),
  publicCtaPrimaryHref: z.string().trim().optional(),
  publicCtaSecondaryLabel: z.string().trim().optional(),
  publicCtaSecondaryHref: z.string().trim().optional(),
});

function formTextOrNull(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export async function updatePublicHomepageSettingsAction(
  clubId: string,
  clubSlug: string,
  formData: FormData,
) {
  await requireClubAdminForClub(clubId, clubSlug, `/${clubSlug}/admin/site-settings`);

  const parsed = publicHomepageSettingsSchema.safeParse({
    publicHeroTitle: formTextOrNull(formData, "publicHeroTitle"),
    publicHeroSubtitle: formTextOrNull(formData, "publicHeroSubtitle"),
    publicHeroPrimaryCtaLabel: formTextOrNull(formData, "publicHeroPrimaryCtaLabel"),
    publicHeroPrimaryCtaHref: formTextOrNull(formData, "publicHeroPrimaryCtaHref"),
    publicHeroSecondaryCtaLabel: formTextOrNull(formData, "publicHeroSecondaryCtaLabel"),
    publicHeroSecondaryCtaHref: formTextOrNull(formData, "publicHeroSecondaryCtaHref"),
    publicHeroTertiaryCtaLabel: formTextOrNull(formData, "publicHeroTertiaryCtaLabel"),
    publicHeroTertiaryCtaHref: formTextOrNull(formData, "publicHeroTertiaryCtaHref"),
    publicHeroQuaternaryCtaLabel: formTextOrNull(formData, "publicHeroQuaternaryCtaLabel"),
    publicHeroQuaternaryCtaHref: formTextOrNull(formData, "publicHeroQuaternaryCtaHref"),
    publicIntroTitle: formTextOrNull(formData, "publicIntroTitle"),
    publicIntroLinkLabel: formTextOrNull(formData, "publicIntroLinkLabel"),
    publicIntroLinkHref: formTextOrNull(formData, "publicIntroLinkHref"),
    publicIntroCard1Icon: formTextOrNull(formData, "publicIntroCard1Icon"),
    publicIntroCard1Title: formTextOrNull(formData, "publicIntroCard1Title"),
    publicIntroCard1Text: formTextOrNull(formData, "publicIntroCard1Text"),
    publicIntroCard1Href: formTextOrNull(formData, "publicIntroCard1Href"),
    publicIntroCard2Icon: formTextOrNull(formData, "publicIntroCard2Icon"),
    publicIntroCard2Title: formTextOrNull(formData, "publicIntroCard2Title"),
    publicIntroCard2Text: formTextOrNull(formData, "publicIntroCard2Text"),
    publicIntroCard2Href: formTextOrNull(formData, "publicIntroCard2Href"),
    publicIntroCard3Icon: formTextOrNull(formData, "publicIntroCard3Icon"),
    publicIntroCard3Title: formTextOrNull(formData, "publicIntroCard3Title"),
    publicIntroCard3Text: formTextOrNull(formData, "publicIntroCard3Text"),
    publicIntroCard3Href: formTextOrNull(formData, "publicIntroCard3Href"),
    publicCtaSectionTitle: formTextOrNull(formData, "publicCtaSectionTitle"),
    publicCtaSectionLinkLabel: formTextOrNull(formData, "publicCtaSectionLinkLabel"),
    publicCtaSectionLinkHref: formTextOrNull(formData, "publicCtaSectionLinkHref"),
    publicCtaBoxIcon: formTextOrNull(formData, "publicCtaBoxIcon"),
    publicCtaBoxTitle: formTextOrNull(formData, "publicCtaBoxTitle"),
    publicCtaBoxText: formTextOrNull(formData, "publicCtaBoxText"),
    publicCtaPrimaryLabel: formTextOrNull(formData, "publicCtaPrimaryLabel"),
    publicCtaPrimaryHref: formTextOrNull(formData, "publicCtaPrimaryHref"),
    publicCtaSecondaryLabel: formTextOrNull(formData, "publicCtaSecondaryLabel"),
    publicCtaSecondaryHref: formTextOrNull(formData, "publicCtaSecondaryHref"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Public forside-indstillingerne kunne ikke gemmes.",
    };
  }

  try {
    await updatePublicHomepageSettings(clubId, {
      publicHeroTitle: parsed.data.publicHeroTitle ?? null,
      publicHeroSubtitle: parsed.data.publicHeroSubtitle ?? null,
      publicHeroPrimaryCtaLabel: parsed.data.publicHeroPrimaryCtaLabel ?? null,
      publicHeroPrimaryCtaHref: parsed.data.publicHeroPrimaryCtaHref ?? null,
      publicHeroSecondaryCtaLabel: parsed.data.publicHeroSecondaryCtaLabel ?? null,
      publicHeroSecondaryCtaHref: parsed.data.publicHeroSecondaryCtaHref ?? null,
      publicHeroTertiaryCtaLabel: parsed.data.publicHeroTertiaryCtaLabel ?? null,
      publicHeroTertiaryCtaHref: parsed.data.publicHeroTertiaryCtaHref ?? null,
      publicHeroQuaternaryCtaLabel: parsed.data.publicHeroQuaternaryCtaLabel ?? null,
      publicHeroQuaternaryCtaHref: parsed.data.publicHeroQuaternaryCtaHref ?? null,
      publicIntroTitle: parsed.data.publicIntroTitle ?? null,
      publicIntroLinkLabel: parsed.data.publicIntroLinkLabel ?? null,
      publicIntroLinkHref: parsed.data.publicIntroLinkHref ?? null,
      publicIntroCard1Icon: parsed.data.publicIntroCard1Icon ?? null,
      publicIntroCard1Title: parsed.data.publicIntroCard1Title ?? null,
      publicIntroCard1Text: parsed.data.publicIntroCard1Text ?? null,
      publicIntroCard1Href: parsed.data.publicIntroCard1Href ?? null,
      publicIntroCard2Icon: parsed.data.publicIntroCard2Icon ?? null,
      publicIntroCard2Title: parsed.data.publicIntroCard2Title ?? null,
      publicIntroCard2Text: parsed.data.publicIntroCard2Text ?? null,
      publicIntroCard2Href: parsed.data.publicIntroCard2Href ?? null,
      publicIntroCard3Icon: parsed.data.publicIntroCard3Icon ?? null,
      publicIntroCard3Title: parsed.data.publicIntroCard3Title ?? null,
      publicIntroCard3Text: parsed.data.publicIntroCard3Text ?? null,
      publicIntroCard3Href: parsed.data.publicIntroCard3Href ?? null,
      publicCtaSectionTitle: parsed.data.publicCtaSectionTitle ?? null,
      publicCtaSectionLinkLabel: parsed.data.publicCtaSectionLinkLabel ?? null,
      publicCtaSectionLinkHref: parsed.data.publicCtaSectionLinkHref ?? null,
      publicCtaBoxIcon: parsed.data.publicCtaBoxIcon ?? null,
      publicCtaBoxTitle: parsed.data.publicCtaBoxTitle ?? null,
      publicCtaBoxText: parsed.data.publicCtaBoxText ?? null,
      publicCtaPrimaryLabel: parsed.data.publicCtaPrimaryLabel ?? null,
      publicCtaPrimaryHref: parsed.data.publicCtaPrimaryHref ?? null,
      publicCtaSecondaryLabel: parsed.data.publicCtaSecondaryLabel ?? null,
      publicCtaSecondaryHref: parsed.data.publicCtaSecondaryHref ?? null,
    });

    revalidatePath(`/${clubSlug}/admin/site-settings`);
    revalidatePath(`/${clubSlug}`);

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to update public homepage settings", error);
    return {
      success: false,
      error: "Der skete en fejl ved gemning af public forside.",
    };
  }
}
