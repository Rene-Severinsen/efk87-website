import Link from "next/link";
import { resolvePublicPageForClub } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../components/publicSite/ThemedBuildingBlocks";
import { publicRoutes } from "../../../lib/publicRoutes";

interface AboutPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

type AboutTile = {
  title: string;
  description: string;
  icon: string;
  href?: string;
  available?: boolean;
};

export default async function AboutPage({ params }: AboutPageProps) {
  const { clubSlug } = await params;

  const { club, page, theme, footerData, navigationItems, actionItems } =
      await resolvePublicPageForClub(clubSlug, "about");

  const title = page?.title ?? `Om ${club.settings?.shortName || club.name}`;
  const body = page?.body?.trim();

  const showIntro =
      !!body &&
      body !== "Information om klubben vil snart være tilgængelig." &&
      body !== "Club profile content will be managed here.";

  const tiles: AboutTile[] = [
    {
      title: "Medlemmerne",
      description: "Overblik over klubbens medlemmer og medlemsliv.",
      icon: "👥",
      href: publicRoutes.members(clubSlug),
      available: true,
    },
    {
      title: "Bestyrelsen",
      description: "Læs om klubbens bestyrelse og ansvarlige personer.",
      icon: "🧑‍💼",
      available: false,
    },
    {
      title: "Økonomi",
      description: "Kontingent, klubøkonomi og praktiske forhold.",
      icon: "💰",
      available: false,
    },
    {
      title: "Regler og bestemmelser",
      description: "Vedtægter, regler og retningslinjer for klubben.",
      icon: "📘",
      available: false,
    },
    {
      title: "Her bor vi",
      description: "Se hvor klubben holder til og få praktisk info om pladsen.",
      icon: "📍",
      available: false,
    },
    {
      title: "Kontakt",
      description: "Find bestyrelse, instruktører og kontaktpersoner.",
      icon: "☎️",
      href: publicRoutes.contact(clubSlug),
      available: true,
    },
    {
      title: "Statistik",
      description: "Historik, udvikling og nøgletal om klubben.",
      icon: "📊",
      available: false,
    },
    {
      title: "Klubmestre",
      description: "Se tidligere og nuværende klubmestre.",
      icon: "🏆",
      available: false,
    },
  ];

  const sponsors = [
    "Nordea-fonden",
    "Friluftsrådet",
    "Lokale og Anlægsfonden",
    "Ellehammerfonden",
    "Modelflyvning Danmark",
  ];

  return (
      <ThemedClubPageShell
          clubSlug={clubSlug}
          clubName={club.settings?.shortName || club.name}
          clubDisplayName={club.settings?.displayName || club.name}
          theme={theme}
          footerData={footerData}
          navigationItems={navigationItems}
          actionItems={actionItems}
          title={title}
          currentPath={publicRoutes.about(clubSlug)}
      >
        <div className="space-y-8 sm:space-y-10">
          {showIntro && (
              <ThemedSectionCard className="p-5 sm:p-7">
                <p className="max-w-4xl text-base leading-relaxed text-[var(--public-text)] sm:text-lg">
                  {body}
                </p>
              </ThemedSectionCard>
          )}

          <section>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {tiles.map((tile) => {
                const cardContent = (
                    <div
                        className={`group flex h-full min-h-[210px] flex-col rounded-3xl border p-6 shadow-[var(--public-shadow)] transition ${
                            tile.available && tile.href
                                ? "border-[var(--public-card-border)] bg-[var(--public-card)] hover:border-[var(--public-primary)] hover:bg-[var(--public-surface)]"
                                : "border-[var(--public-card-border)] bg-[var(--public-card)]"
                        }`}
                    >
                      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-primary-soft)] text-2xl">
                        <span aria-hidden="true">{tile.icon}</span>
                      </div>

                      <div className="mb-2 text-2xl font-bold leading-tight text-[var(--public-text)]">
                        {tile.title}
                      </div>

                      <p className="text-sm leading-relaxed text-[var(--public-text-muted)] sm:text-base">
                        {tile.description}
                      </p>

                      <div className="mt-auto pt-6">
                        {tile.available && tile.href ? (
                            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--public-card-border)] bg-[var(--public-primary-soft)] px-4 py-2 text-sm font-semibold text-[var(--public-primary)] transition group-hover:border-[var(--public-primary)]">
                        Åbn
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-transform group-hover:translate-x-1"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                        ) : (
                            <span className="inline-flex items-center rounded-full border border-[var(--public-card-border)] bg-[var(--public-surface)] px-4 py-2 text-sm font-semibold text-[var(--public-text-soft)]">
                        Kommer senere
                      </span>
                        )}
                      </div>
                    </div>
                );

                if (tile.available && tile.href) {
                  return (
                      <Link
                          key={tile.title}
                          href={tile.href}
                          className="block h-full"
                      >
                        {cardContent}
                      </Link>
                  );
                }

                return <div key={tile.title}>{cardContent}</div>;
              })}
            </div>
          </section>

          <section>
            <ThemedSectionCard className="p-5 sm:p-7">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
                  Sponsorer og samarbejdspartnere
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--public-text-muted)] sm:text-base">
                  Vi er sponsoreret af og samarbejder med følgende organisationer.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {sponsors.map((sponsor) => (
                    <div
                        key={sponsor}
                        className="flex min-h-[92px] items-center justify-center rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)] px-5 py-6 text-center shadow-[var(--public-shadow)]"
                    >
                  <span className="text-base font-semibold text-[var(--public-text)] sm:text-lg">
                    {sponsor}
                  </span>
                    </div>
                ))}
              </div>
            </ThemedSectionCard>
          </section>
        </div>
      </ThemedClubPageShell>
  );
}