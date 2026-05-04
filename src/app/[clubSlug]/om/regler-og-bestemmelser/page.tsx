import { resolvePublicPageForClub } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { publicRoutes } from "../../../../lib/publicRoutes";
import { getClubRulesPageContent } from "../../../../lib/rulesPage/rulesPageService";

interface RulesPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

function RichTextBlock({ html }: { html: string }) {
  return (
    <div
      className="space-y-4 text-base font-normal leading-relaxed text-[var(--public-text)] [&_a]:font-semibold [&_a]:text-[var(--public-primary)] [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--public-primary)] [&_blockquote]:pl-4 [&_blockquote]:text-[var(--public-text-muted)] [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:text-xl [&_h3]:font-bold [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default async function RulesPage({ params }: RulesPageProps) {
  const { clubSlug } = await params;
  const pageSlug = "regler-og-bestemmelser";

  const {
    club,
    theme,
    footerData,
    navigationItems,
    actionItems,
    publicSettings,
  } = await resolvePublicPageForClub(clubSlug, pageSlug);

  const content = await getClubRulesPageContent(club.id);

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
      title="Regler og bestemmelser"
      subtitle="Her finder du klubbens flyveregler, flyvezone, lovtekst og praktiske retningslinjer."
      currentPath={publicRoutes.rules(clubSlug)}
      maxWidth="1120px"
    >
      <div className="mt-6 space-y-6">
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ThemedSectionCard className="flex h-full flex-col p-5 sm:p-6">
            <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
              Klubbens flyveregler
            </h2>

            <p className="mt-3 text-base font-normal leading-relaxed text-[var(--public-text)]">
              Her finder du Elektroflyveklubben af 1987&apos;s egne flyveregler.
              Reglerne gælder for brug af klubbens flyveplads og skal følges af medlemmer og gæster.
            </p>

            <div className="mt-auto pt-6">
              <a
                href={content.ownRulesPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="public-primary-button"
              >
                Åbn flyveregler
              </a>
            </div>
          </ThemedSectionCard>

          <ThemedSectionCard className="flex h-full flex-col p-5 sm:p-6">
            <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
              Flyvezone
            </h2>

            <p className="mt-3 text-base font-normal leading-relaxed text-[var(--public-text)]">
              Flyvezonen viser det område, hvor der må flyves. Brug den som praktisk reference,
              når du planlægger flyvning på pladsen.
            </p>

            {content.flightZoneImageUrl ? (
              <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)]">
                <img
                  src={content.flightZoneImageUrl}
                  alt="Flyvezone for Elektroflyveklubben af 1987"
                  className="h-auto w-full object-cover"
                />
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-primary-soft)] p-5 text-sm font-semibold text-[var(--public-primary)]">
                Billede over flyvezone tilføjes senere i Admin.
              </div>
            )}

            {content.flightZoneImageUrl ? (
              <div className="mt-auto pt-6">
                <a
                  href={content.flightZoneImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="public-secondary-button"
                >
                  Åbn flyvezone
                </a>
              </div>
            ) : null}
          </ThemedSectionCard>
        </section>

        <ThemedSectionCard className="p-5 sm:p-6">
          <h2 className="mb-4 text-xl font-bold text-[var(--public-text)] sm:text-2xl">
            Lovtekst og myndighedsregler
          </h2>

          <RichTextBlock html={content.legalTextHtml} />
        </ThemedSectionCard>

        <ThemedSectionCard className="p-5 sm:p-6">
          <h2 className="mb-4 text-xl font-bold text-[var(--public-text)] sm:text-2xl">
            Praktiske retningslinjer
          </h2>

          <RichTextBlock html={content.practicalTextHtml} />
        </ThemedSectionCard>
      </div>
    </ThemedClubPageShell>
  );
}
