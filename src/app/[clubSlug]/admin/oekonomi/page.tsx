import Link from "next/link";
import { resolvePublicPageForClub } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { getClubFinancePageContent } from "../../../../lib/financePage/financePageService";
import { publicRoutes } from "../../../../lib/publicRoutes";

interface FinancePageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

function getParagraphs(text: string): string[] {
  return text
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
}

function TextBlock({ text }: { text: string }) {
  return (
      <div className="space-y-4 text-base font-normal leading-relaxed text-[var(--public-text)]">
        {getParagraphs(text).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
  );
}

export default async function FinancePage({ params }: FinancePageProps) {
  const { clubSlug } = await params;
  const pageSlug = "oekonomi";

  const {
    club,
    theme,
    footerData,
    navigationItems,
    actionItems,
    publicSettings,
  } = await resolvePublicPageForClub(clubSlug, pageSlug);

  const content = await getClubFinancePageContent(club.id);

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
          title="Økonomi"
          subtitle="Information om udgiftsbilag, refusion, forskud og udbetaling."
          currentPath={publicRoutes.finance(clubSlug)}
          maxWidth="1120px"
      >
        <div className="mt-6 space-y-6">
          <ThemedSectionCard className="p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-center">
              <div>
                <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
                  Send udgiftsbilag
                </h2>

                <p className="mt-3 text-base font-normal leading-relaxed text-[var(--public-text)]">
                  {content.introText}
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-primary-soft)] p-4">
                <p className="text-sm font-semibold text-[var(--public-text-muted)]">
                  Bilagsmail
                </p>

                <a
                    href={`mailto:${content.expenseEmail}`}
                    className="mt-2 block text-xl font-bold text-[var(--public-primary)]"
                >
                  {content.expenseEmail}
                </a>
              </div>
            </div>
          </ThemedSectionCard>

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ThemedSectionCard className="p-5 sm:p-6">
              <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
                Bilaget skal indeholde
              </h2>

              <div className="mt-5 rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-4">
                <ul className="space-y-3 text-base font-normal text-[var(--public-text)]">
                  <li className="flex gap-3">
                    <span className="text-[var(--public-primary)]">✓</span>
                    <span>Navn</span>
                  </li>

                  <li className="flex gap-3">
                    <span className="text-[var(--public-primary)]">✓</span>
                    <span>MobilePay-nummer</span>
                  </li>

                  <li className="pl-8 text-sm font-semibold uppercase tracking-wide text-[var(--public-text-muted)]">
                    eller
                  </li>

                  <li className="flex gap-3">
                    <span className="text-[var(--public-primary)]">✓</span>
                    <span>Reg. nr.: Dit pengeinstituts registreringsnummer</span>
                  </li>

                  <li className="flex gap-3">
                    <span className="text-[var(--public-primary)]">✓</span>
                    <span>Konto nr.: Dit kontonummer</span>
                  </li>
                </ul>
              </div>
            </ThemedSectionCard>

            <ThemedSectionCard className="p-5 sm:p-6">
              <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
                Forhåndsgodkendelse
              </h2>

              <div className="mt-4">
                <TextBlock text={content.approvalText} />
              </div>
            </ThemedSectionCard>
          </section>

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ThemedSectionCard className="p-5 sm:p-6">
              <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
                Forskud
              </h2>

              <div className="mt-4">
                <TextBlock text={content.advanceText} />
              </div>
            </ThemedSectionCard>

            <ThemedSectionCard className="p-5 sm:p-6">
              <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
                Udbetaling
              </h2>

              <div className="mt-4">
                <TextBlock text={content.payoutText} />
              </div>
            </ThemedSectionCard>
          </section>

          <ThemedSectionCard className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[var(--public-text)]">
                  Spørgsmål om økonomi?
                </h2>
                <p className="mt-2 text-base font-normal leading-relaxed text-[var(--public-text-muted)]">
                  Kontakt kassereren eller en anden relevant kontaktperson.
                </p>
              </div>

              <Link href={publicRoutes.contact(clubSlug)} className="public-secondary-button">
                Se kontaktpersoner
              </Link>
            </div>
          </ThemedSectionCard>
        </div>
      </ThemedClubPageShell>
  );
}