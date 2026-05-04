import { resolvePublicPageForClub } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { publicRoutes } from "../../../../lib/publicRoutes";
import { getClubLocationPageContent } from "../../../../lib/locationPage/locationPageService";

interface WhereWeLivePageProps {
    params: Promise<{
        clubSlug: string;
    }>;
}

function formatCoordinate(value: number | null | undefined): string | null {
    if (typeof value !== "number" || Number.isNaN(value)) return null;

    return value.toFixed(6);
}

function formatDms(value: number, type: "lat" | "lon"): string {
    const absolute = Math.abs(value);
    const degrees = Math.floor(absolute);
    const minutesDecimal = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesDecimal);
    const seconds = (minutesDecimal - minutes) * 60;
    const direction =
        type === "lat"
            ? value >= 0
                ? "N"
                : "S"
            : value >= 0
                ? "E"
                : "W";

    return `${degrees}°${minutes.toString().padStart(2, "0")}'${seconds
        .toFixed(1)
        .padStart(4, "0")}"${direction}`;
}

function getMapsLinks(latitude: number | null | undefined, longitude: number | null | undefined) {
    if (typeof latitude !== "number" || typeof longitude !== "number") {
        return null;
    }

    const coordinates = `${latitude},${longitude}`;

    return {
        googleMaps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordinates)}`,
        appleMaps: `https://maps.apple.com/?ll=${encodeURIComponent(coordinates)}&q=${encodeURIComponent("EFK87")}`,
    };
}

function getParagraphs(text: string): string[] {
    return text
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
}

function getLines(text: string): string[] {
    return text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
}

function ImageBlock({
                        imageUrl,
                        title,
                        description,
                        alt,
                    }: {
    imageUrl: string | null;
    title: string;
    description: string;
    alt: string;
}) {
    return (
        <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)]">
            {imageUrl ? (
                <div className="aspect-[16/9] border-b border-[var(--public-card-border)] bg-[var(--public-surface)]">
                    <img
                        src={imageUrl}
                        alt={alt}
                        className="h-full w-full object-cover"
                    />
                </div>
            ) : (
                <div className="flex aspect-[16/9] items-center justify-center border-b border-[var(--public-card-border)] bg-[var(--public-primary-soft)]">
                    <div className="flex flex-col items-center gap-3 px-6 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-card)] text-[var(--public-primary)]">
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>

                        <p className="text-sm font-semibold text-[var(--public-primary)]">
                            Billede tilføjes senere fra Admin
                        </p>
                    </div>
                </div>
            )}

            <div className="p-4">
                <h3 className="text-base font-bold text-[var(--public-text)]">
                    {title}
                </h3>

                <p className="mt-1 text-sm font-normal leading-relaxed text-[var(--public-text-muted)]">
                    {description}
                </p>
            </div>
        </div>
    );
}

export default async function WhereWeLivePage({ params }: WhereWeLivePageProps) {
    const { clubSlug } = await params;
    const pageSlug = "her-bor-vi";

    const {
        club,
        theme,
        footerData,
        navigationItems,
        actionItems,
        publicSettings,
    } = await resolvePublicPageForClub(clubSlug, pageSlug);

    const content = await getClubLocationPageContent(club.id);

    const latitude = club.settings?.weatherLatitude ?? null;
    const longitude = club.settings?.weatherLongitude ?? null;
    const formattedLatitude = formatCoordinate(latitude);
    const formattedLongitude = formatCoordinate(longitude);
    const mapsLinks = getMapsLinks(latitude, longitude);

    const drivingGuideParagraphs = getParagraphs(content.drivingGuide);
    const parkingGuideParagraphs = getParagraphs(content.parkingGuide);
    const indoorAddressLines = getLines(content.indoorAddress);

    return (
        <ThemedClubPageShell
            clubSlug={clubSlug}
            clubName={club.settings?.shortName || club.name}
            clubDisplayName={publicSettings?.displayName || club.settings?.displayName || club.name}
      logoUrl={publicSettings?.logoUrl ?? null}
      logoAltText={publicSettings?.logoAltText ?? null}
            theme={theme}
            publicThemeMode={publicSettings?.publicThemeMode}
            footerData={footerData}
            navigationItems={navigationItems}
            actionItems={actionItems}
            title="Her bor vi"
            subtitle="Find vej til klubben, se GPS-positionen og få praktisk information om adgang og indendørsflyvning."
            currentPath={publicRoutes.whereWeLive(clubSlug)}
            maxWidth="1120px"
        >
            <div className="mt-6 space-y-6">
                <ThemedSectionCard className="p-5 sm:p-6">
                    <div className="mb-5 flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-primary-soft)] text-[var(--public-primary)]">
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                                />
                            </svg>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
                                Find klubben
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-[var(--public-text-muted)] sm:text-base">
                                Brug GPS-positionen som pejlemærke, men følg kørevejledningen her på siden.
                                Korttjenester kan vise forkert adgangsvej på området.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-4">
                        <p className="text-sm font-semibold text-[var(--public-text-muted)]">
                            GPS-position
                        </p>

                        {formattedLatitude && formattedLongitude && typeof latitude === "number" && typeof longitude === "number" ? (
                            <div className="mt-2 space-y-1 text-base font-normal leading-relaxed text-[var(--public-text)]">
                                <p>Decimalgrader: {formattedLatitude} / {formattedLongitude}</p>
                                <p>
                                    DMS: {formatDms(latitude, "lat")} / {formatDms(longitude, "lon")}
                                </p>
                            </div>
                        ) : (
                            <p className="mt-2 text-base font-normal text-[var(--public-text)]">
                                GPS-position er endnu ikke registreret i klubbens indstillinger.
                            </p>
                        )}

                        {mapsLinks ? (
                            <div className="mt-5 flex flex-wrap gap-3">
                                <a
                                    href={mapsLinks.googleMaps}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="public-primary-button"
                                >
                                    Åbn i Google Maps
                                </a>

                                <a
                                    href={mapsLinks.appleMaps}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="public-secondary-button"
                                >
                                    Åbn i Apple Maps
                                </a>
                            </div>
                        ) : null}
                    </div>

                    <ImageBlock
                        imageUrl={content.accessImageUrl}
                        title={content.accessImageTitle}
                        description={content.accessImageDescription}
                        alt={content.accessImageAlt}
                    />
                </ThemedSectionCard>

                <ThemedSectionCard className="p-5 sm:p-6">
                    <div className="mb-5 flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-primary-soft)] text-[var(--public-primary)]">
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                                />
                            </svg>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
                                Vigtig adgangsinformation
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-[var(--public-text-muted)] sm:text-base">
                                Navigationsapps kan forsøge at lede dig ind via adgangsveje, der ikke må bruges.
                                Følg klubbens egen vejledning nedenfor.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-primary-soft)] p-4">
                        <p className="text-base font-semibold leading-relaxed text-[var(--public-text)]">
                            {content.accessNotice}
                        </p>
                    </div>
                </ThemedSectionCard>

                <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <ThemedSectionCard className="p-5 sm:p-6">
                        <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
                            Kørselsvejledning
                        </h2>

                        <div className="mt-4 space-y-4 text-base font-normal leading-relaxed text-[var(--public-text)]">
                            {drivingGuideParagraphs.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}
                        </div>

                        <ImageBlock
                            imageUrl={content.drivingImageUrl}
                            title={content.drivingImageTitle}
                            description={content.drivingImageDescription}
                            alt={content.drivingImageAlt}
                        />
                    </ThemedSectionCard>

                    <ThemedSectionCard className="p-5 sm:p-6">
                        <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
                            Parkering og adgang
                        </h2>

                        <div className="mt-4 space-y-4 text-base font-normal leading-relaxed text-[var(--public-text)]">
                            {parkingGuideParagraphs.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}
                        </div>

                        <ImageBlock
                            imageUrl={content.parkingImageUrl}
                            title={content.parkingImageTitle}
                            description={content.parkingImageDescription}
                            alt={content.parkingImageAlt}
                        />
                    </ThemedSectionCard>
                </section>

                <ThemedSectionCard className="p-5 sm:p-6">
                    <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
                        {content.indoorTitle}
                    </h2>

                    <p className="mt-3 text-base font-normal leading-relaxed text-[var(--public-text)]">
                        {content.indoorDescription}
                    </p>

                    <div className="mt-5 rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-4">
                        <h3 className="text-lg font-bold text-[var(--public-text)]">
                            {content.indoorVenueName}
                        </h3>

                        <div className="mt-2 space-y-1 text-base font-normal leading-relaxed text-[var(--public-text)]">
                            {indoorAddressLines.map((line) => (
                                <p key={line}>{line}</p>
                            ))}
                            <p>{content.indoorSchedule}</p>
                        </div>

                        <p className="mt-4 text-sm leading-relaxed text-[var(--public-text-muted)]">
                            {content.indoorNote}
                        </p>
                    </div>

                    <ImageBlock
                        imageUrl={content.indoorImageUrl}
                        title={content.indoorImageTitle}
                        description={content.indoorImageDescription}
                        alt={content.indoorImageAlt}
                    />
                </ThemedSectionCard>
            </div>
        </ThemedClubPageShell>
    );
}