import { resolvePublicPageForClub } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { publicRoutes } from "../../../../lib/publicRoutes";

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

function ImagePlaceholder({
                              title,
                              description,
                          }: {
    title: string;
    description: string;
}) {
    return (
        <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)]">
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

    const latitude = club.settings?.weatherLatitude ?? null;
    const longitude = club.settings?.weatherLongitude ?? null;
    const formattedLatitude = formatCoordinate(latitude);
    const formattedLongitude = formatCoordinate(longitude);
    const mapsLinks = getMapsLinks(latitude, longitude);

    return (
        <ThemedClubPageShell
            clubSlug={clubSlug}
            clubName={club.settings?.shortName || club.name}
            clubDisplayName={publicSettings?.displayName || club.settings?.displayName || club.name}
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

                    <ImagePlaceholder
                        title="Kort over adgangsvej til pladsen"
                        description="Her vises senere et tydeligt billede/kort, der viser den korrekte adgangsvej til klubområdet."
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
                            Kør efter Faldskærmsvej, 3500 Værløse, men drej til højre ad betonbanen
                            ved Propelvej. Følg derefter anvisningen til klubområdet.
                        </p>
                    </div>
                </ThemedSectionCard>

                <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <ThemedSectionCard className="p-5 sm:p-6">
                        <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
                            Kørselsvejledning
                        </h2>

                        <div className="mt-4 space-y-4 text-base font-normal leading-relaxed text-[var(--public-text)]">
                            <p>
                                Kør efter Faldskærmsvej, 3500 Værløse, men drej til højre ad betonbanen
                                ved Propelvej. Lige før Faldskærmsvej starter, kører du ind på betonbanen.
                            </p>

                            <p>
                                For enden af betonbanen er der en bom. Cykler og gående kan komme igennem.
                                Det kan give problemer, hvis navigationsapps forsøger at føre dig via andre
                                adgangsveje i området.
                            </p>

                            <p>
                                Skal du ind med bil, kræver det normalt adgang efter aftale med klubben.
                                Kontakt en relevant kontaktperson, hvis du er i tvivl.
                            </p>
                        </div>

                        <ImagePlaceholder
                            title="Kørselsvej og betonbane"
                            description="Her vises senere billede/kort over betonbanen, bommen og den korrekte vej ind."
                        />
                    </ThemedSectionCard>

                    <ThemedSectionCard className="p-5 sm:p-6">
                        <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
                            Parkering og adgang
                        </h2>

                        <div className="mt-4 space-y-4 text-base font-normal leading-relaxed text-[var(--public-text)]">
                            <p>
                                Parkér på skrå på modsat side af betonklodserne inden bommen helt ind
                                mod flyvestationen. Parkér ikke på betonbanen eller foran bommen.
                            </p>

                            <p>
                                Undgå at køre efter kortforslag, der fører gennem private eller lukkede
                                områder. Det giver unødig gene for naboer og andre brugere af området.
                            </p>

                            <p>
                                Er du ny besøgende, så spørg hellere en ekstra gang. Det er lettere end
                                at skulle vende et sted, hvor man egentlig ikke skulle have været.
                            </p>
                        </div>

                        <ImagePlaceholder
                            title="Parkering og bom"
                            description="Her vises senere billede/kort over parkering, bom og praktisk adgang til flyveområdet."
                        />
                    </ThemedSectionCard>
                </section>

                <ThemedSectionCard className="p-5 sm:p-6">
                    <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
                        Indendørs flyvning
                    </h2>

                    <p className="mt-3 text-base font-normal leading-relaxed text-[var(--public-text)]">
                        Klubben har også indendørsflyvning i vintersæsonen. Her flyves der med
                        mindre modeller i hal, når vejret og sæsonen kalder på indendørs aktivitet.
                    </p>

                    <div className="mt-5 rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-4">
                        <h3 className="text-lg font-bold text-[var(--public-text)]">
                            Solvanghallen
                        </h3>

                        <div className="mt-2 space-y-1 text-base font-normal leading-relaxed text-[var(--public-text)]">
                            <p>Solvangskolen</p>
                            <p>Nordtoftevej 58</p>
                            <p>3520 Farum</p>
                            <p>Typisk søndag kl. 18–22 i sæsonen.</p>
                        </div>

                        <p className="mt-4 text-sm leading-relaxed text-[var(--public-text-muted)]">
                            Tider og adgang kan ændre sig. Følg klubbens aktuelle informationer,
                            hvis der annonceres særskilte tider for indendørsflyvning.
                        </p>
                    </div>

                    <ImagePlaceholder
                        title="Indendørsflyvning og parkering"
                        description="Her vises senere billede/kort over hal, indgang og parkering til indendørsflyvning."
                    />
                </ThemedSectionCard>
            </div>
        </ThemedClubPageShell>
    );
}