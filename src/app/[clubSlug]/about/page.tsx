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

export default async function AboutPage({ params }: AboutPageProps) {
  const { clubSlug } = await params;
  const pageSlug = "about";

  const {
    club,
    page,
    theme,
    footerData,
    navigationItems,
    actionItems,
  } = await resolvePublicPageForClub(clubSlug, pageSlug);

  const clubShortName = club.settings?.shortName || club.name;

  const title = `Om ${clubShortName}`;

  const body =
      page?.body?.trim() ||
      `${clubShortName} er en modelflyveklub med fokus på fællesskab, flyvning, læring og gode oplevelser på pladsen. Her finder du information om klubben, aktiviteterne og hvordan du kommer i kontakt med os.`;

  return (
      <ThemedClubPageShell
          clubSlug={clubSlug}
          clubName={clubShortName}
          clubDisplayName={club.settings?.displayName || club.name}
          theme={theme}
          footerData={footerData}
          navigationItems={navigationItems}
          actionItems={actionItems}
          title={title}
          currentPath={publicRoutes.about(clubSlug)}
      >
        <ThemedSectionCard className="p-5 sm:p-8">
          <div className="max-w-4xl">
            <p className="text-base leading-relaxed text-[var(--public-text)] sm:text-lg">
              {body}
            </p>
          </div>

          <div className="mt-8 border-t border-[var(--public-card-border)] pt-6 sm:mt-10 sm:pt-8">
            <div className="max-w-3xl">
              <h2 className="mb-3 text-xl font-bold tracking-tight text-[var(--public-text)] sm:text-2xl">
                Kontakt
              </h2>

              <p className="mb-6 text-sm leading-relaxed text-[var(--public-text-muted)] sm:text-base">
                Har du spørgsmål, eller vil du vide mere om klubben? Find vores
                instruktører og kontaktpersoner her.
              </p>

              <Link
                  href={publicRoutes.contact(clubSlug)}
                  className="public-secondary-button"
              >
                Se instruktører
                <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </ThemedSectionCard>
      </ThemedClubPageShell>
  );
}