import prisma from "../db/prisma";
import {
    ClubLocationPageContent,
    DEFAULT_LOCATION_PAGE_CONTENT,
} from "./locationPageDefaults";

function normalizeNullableText(value: string | null): string | null {
    const trimmed = value?.trim();

    return trimmed ? trimmed : null;
}

function normalizeText(value: string | null, fallback: string): string {
    const trimmed = value?.trim();

    return trimmed || fallback;
}

export async function getClubLocationPageContent(
    clubId: string,
): Promise<ClubLocationPageContent> {
    const locationPage = await prisma.clubLocationPage.findUnique({
        where: { clubId },
    });

    if (!locationPage) {
        return DEFAULT_LOCATION_PAGE_CONTENT;
    }

    return {
        accessNotice: normalizeText(locationPage.accessNotice, DEFAULT_LOCATION_PAGE_CONTENT.accessNotice),
        drivingGuide: normalizeText(locationPage.drivingGuide, DEFAULT_LOCATION_PAGE_CONTENT.drivingGuide),
        parkingGuide: normalizeText(locationPage.parkingGuide, DEFAULT_LOCATION_PAGE_CONTENT.parkingGuide),

        accessImageUrl: normalizeNullableText(locationPage.accessImageUrl),
        accessImageTitle: normalizeText(locationPage.accessImageTitle, DEFAULT_LOCATION_PAGE_CONTENT.accessImageTitle),
        accessImageDescription: normalizeText(
            locationPage.accessImageDescription,
            DEFAULT_LOCATION_PAGE_CONTENT.accessImageDescription,
        ),
        accessImageAlt: normalizeText(locationPage.accessImageAlt, DEFAULT_LOCATION_PAGE_CONTENT.accessImageAlt),

        drivingImageUrl: normalizeNullableText(locationPage.drivingImageUrl),
        drivingImageTitle: normalizeText(locationPage.drivingImageTitle, DEFAULT_LOCATION_PAGE_CONTENT.drivingImageTitle),
        drivingImageDescription: normalizeText(
            locationPage.drivingImageDescription,
            DEFAULT_LOCATION_PAGE_CONTENT.drivingImageDescription,
        ),
        drivingImageAlt: normalizeText(locationPage.drivingImageAlt, DEFAULT_LOCATION_PAGE_CONTENT.drivingImageAlt),

        parkingImageUrl: normalizeNullableText(locationPage.parkingImageUrl),
        parkingImageTitle: normalizeText(locationPage.parkingImageTitle, DEFAULT_LOCATION_PAGE_CONTENT.parkingImageTitle),
        parkingImageDescription: normalizeText(
            locationPage.parkingImageDescription,
            DEFAULT_LOCATION_PAGE_CONTENT.parkingImageDescription,
        ),
        parkingImageAlt: normalizeText(locationPage.parkingImageAlt, DEFAULT_LOCATION_PAGE_CONTENT.parkingImageAlt),

        indoorTitle: normalizeText(locationPage.indoorTitle, DEFAULT_LOCATION_PAGE_CONTENT.indoorTitle),
        indoorDescription: normalizeText(
            locationPage.indoorDescription,
            DEFAULT_LOCATION_PAGE_CONTENT.indoorDescription,
        ),
        indoorVenueName: normalizeText(locationPage.indoorVenueName, DEFAULT_LOCATION_PAGE_CONTENT.indoorVenueName),
        indoorAddress: normalizeText(locationPage.indoorAddress, DEFAULT_LOCATION_PAGE_CONTENT.indoorAddress),
        indoorSchedule: normalizeText(locationPage.indoorSchedule, DEFAULT_LOCATION_PAGE_CONTENT.indoorSchedule),
        indoorNote: normalizeText(locationPage.indoorNote, DEFAULT_LOCATION_PAGE_CONTENT.indoorNote),

        indoorImageUrl: normalizeNullableText(locationPage.indoorImageUrl),
        indoorImageTitle: normalizeText(locationPage.indoorImageTitle, DEFAULT_LOCATION_PAGE_CONTENT.indoorImageTitle),
        indoorImageDescription: normalizeText(
            locationPage.indoorImageDescription,
            DEFAULT_LOCATION_PAGE_CONTENT.indoorImageDescription,
        ),
        indoorImageAlt: normalizeText(locationPage.indoorImageAlt, DEFAULT_LOCATION_PAGE_CONTENT.indoorImageAlt),
    };
}

export async function upsertClubLocationPageContent(
    clubId: string,
    content: ClubLocationPageContent,
) {
    return prisma.clubLocationPage.upsert({
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