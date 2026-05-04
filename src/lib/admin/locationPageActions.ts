"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireClubBySlug } from "../tenancy/tenantService";
import { requireClubAdminForClub } from "../auth/adminAccessGuards";
import { upsertClubLocationPageContent } from "../locationPage/locationPageService";
import { DEFAULT_LOCATION_PAGE_CONTENT } from "../locationPage/locationPageDefaults";

const optionalUrlSchema = z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null))
    .refine(
        (value) => {
            if (!value) return true;

            try {
                const url = new URL(value);
                return url.protocol === "http:" || url.protocol === "https:";
            } catch {
                return false;
            }
        },
        { message: "Billed-URL skal være en gyldig http/https URL." },
    );

const locationPageSchema = z.object({
    accessNotice: z.string().trim().min(1, "Vigtig adgangsinformation skal udfyldes."),
    drivingGuide: z.string().trim().min(1, "Kørselsvejledning skal udfyldes."),
    parkingGuide: z.string().trim().min(1, "Parkering og adgang skal udfyldes."),

    accessImageUrl: optionalUrlSchema,
    accessImageTitle: z.string().trim().min(1),
    accessImageDescription: z.string().trim().min(1),
    accessImageAlt: z.string().trim().min(1),

    drivingImageUrl: optionalUrlSchema,
    drivingImageTitle: z.string().trim().min(1),
    drivingImageDescription: z.string().trim().min(1),
    drivingImageAlt: z.string().trim().min(1),

    parkingImageUrl: optionalUrlSchema,
    parkingImageTitle: z.string().trim().min(1),
    parkingImageDescription: z.string().trim().min(1),
    parkingImageAlt: z.string().trim().min(1),

    indoorTitle: z.string().trim().min(1),
    indoorDescription: z.string().trim().min(1),
    indoorVenueName: z.string().trim().min(1),
    indoorAddress: z.string().trim().min(1),
    indoorSchedule: z.string().trim().min(1),
    indoorNote: z.string().trim().min(1),

    indoorImageUrl: optionalUrlSchema,
    indoorImageTitle: z.string().trim().min(1),
    indoorImageDescription: z.string().trim().min(1),
    indoorImageAlt: z.string().trim().min(1),
});

function getText(formData: FormData, key: string): string {
    const value = formData.get(key);

    return typeof value === "string" ? value : "";
}

export async function updateLocationPageContentAction(
    clubSlug: string,
    formData: FormData,
) {
    const club = await requireClubBySlug(clubSlug);
    await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/her-bor-vi`);

    const parsed = locationPageSchema.safeParse({
        accessNotice: getText(formData, "accessNotice"),
        drivingGuide: getText(formData, "drivingGuide"),
        parkingGuide: getText(formData, "parkingGuide"),

        accessImageUrl: getText(formData, "accessImageUrl"),
        accessImageTitle: getText(formData, "accessImageTitle"),
        accessImageDescription: getText(formData, "accessImageDescription"),
        accessImageAlt: getText(formData, "accessImageAlt"),

        drivingImageUrl: getText(formData, "drivingImageUrl"),
        drivingImageTitle: getText(formData, "drivingImageTitle"),
        drivingImageDescription: getText(formData, "drivingImageDescription"),
        drivingImageAlt: getText(formData, "drivingImageAlt"),

        parkingImageUrl: getText(formData, "parkingImageUrl"),
        parkingImageTitle: getText(formData, "parkingImageTitle"),
        parkingImageDescription: getText(formData, "parkingImageDescription"),
        parkingImageAlt: getText(formData, "parkingImageAlt"),

        indoorTitle: getText(formData, "indoorTitle"),
        indoorDescription: getText(formData, "indoorDescription"),
        indoorVenueName: getText(formData, "indoorVenueName"),
        indoorAddress: getText(formData, "indoorAddress"),
        indoorSchedule: getText(formData, "indoorSchedule"),
        indoorNote: getText(formData, "indoorNote"),

        indoorImageUrl: getText(formData, "indoorImageUrl"),
        indoorImageTitle: getText(formData, "indoorImageTitle"),
        indoorImageDescription: getText(formData, "indoorImageDescription"),
        indoorImageAlt: getText(formData, "indoorImageAlt"),
    });

    if (!parsed.success) {
        return {
            success: false,
            error:
                parsed.error.issues[0]?.message ||
                "Der er ugyldige felter i formularen.",
        };
    }

    await upsertClubLocationPageContent(club.id, {
        ...DEFAULT_LOCATION_PAGE_CONTENT,
        ...parsed.data,
    });

    revalidatePath(`/${clubSlug}/admin/her-bor-vi`);
    revalidatePath(`/${clubSlug}/om/her-bor-vi`);
    revalidatePath(`/${clubSlug}/about`);

    return { success: true };
}