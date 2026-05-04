import Link from "next/link";
import { resolvePublicPageForClub } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { getClubMembershipPageContent } from "../../../../lib/membershipPage/membershipPageService";
import { publicRoutes } from "../../../../lib/publicRoutes";

interface MembershipPageProps {
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

export default async function MembershipPage({ params }: MembershipPageProps) {
  const { clubSlug } = await params;
  const pageSlug = "medlemsskab";

  const {
    club,
    theme,
    footerData,
    navigationItems,
    actionItems,
    publicSettings,
  } = await resolvePublicPageForClub(clubSlug, pageSlug);

  const content = await getClubMembershipPageContent(club.id);
  const activeFees = content.fees.filter((fee) => fee.isActive);

  const steps = [
    {
      number: "1",
      title: content.stepOneTitle,
      text: content.stepOneText,
    },
    {
      number: "2",
      title: content.stepTwoTitle,
      text: content.stepTwoText,
    },
    {
      number: "3",
      title: content.stepThreeTitle,
      text: content.stepThreeText,
    },
  ];

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
      title="Medlemsskab"
      subtitle="Information om indmeldelse, kontingenter, opkrævning og praktiske forhold."
      currentPath={publicRoutes.membership(clubSlug)}
      maxWidth="1120px"
    >
      <div className="mt-6 space-y-6">
        <ThemedSectionCard className="p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
                Sådan bliver du medlem
              </h2>

              <p className="mt-3 text-base font-normal leading-relaxed text-[var(--public-text)]">
                {content.introText}
              </p>

              <p className="mt-3 text-base font-normal leading-relaxed text-[var(--public-text-muted)]">
                {content.processIntro}
              </p>
            </div>

            <div className="flex items-start lg:justify-end">
              <Link href={publicRoutes.becomeMember(clubSlug)} className="public-primary-button">
                {content.ctaLabel}
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-5"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--public-primary-soft)] text-sm font-bold text-[var(--public-primary)]">
                  {step.number}
                </div>

                <h3 className="text-lg font-bold text-[var(--public-text)]">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm font-normal leading-relaxed text-[var(--public-text-muted)] sm:text-base">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </ThemedSectionCard>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
              Kontingenter
            </h2>
          </div>

          {activeFees.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {activeFees.map((fee) => (
                <ThemedSectionCard key={fee.title} className="flex h-full flex-col p-5 sm:p-6">
                  <h3 className="text-xl font-bold text-[var(--public-text)]">
                    {fee.title}
                  </h3>

                  <div className="mt-4">
                    <span className="text-3xl font-bold text-[var(--public-primary)]">
                      {fee.price}
                    </span>
                    <span className="ml-3 text-sm font-normal text-[var(--public-text-muted)]">
                      {fee.period}
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--public-text-muted)]">
                      Indmeldelsesgebyr
                    </p>
                    <p className="mt-1 text-lg font-bold text-[var(--public-text)]">
                      {fee.signupFee}
                    </p>
                  </div>

                  <p className="mt-4 text-base font-normal leading-relaxed text-[var(--public-text)]">
                    {fee.description}
                  </p>
                </ThemedSectionCard>
              ))}
            </div>
          ) : (
            <ThemedSectionCard className="p-5 sm:p-6">
              <p className="text-base font-normal text-[var(--public-text-muted)]">
                Kontingenter er endnu ikke oprettet.
              </p>
            </ThemedSectionCard>
          )}
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ThemedSectionCard className="p-5 sm:p-6">
            <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
              Opkrævning og betaling
            </h2>

            <div className="mt-4 space-y-4 text-base font-normal leading-relaxed text-[var(--public-text)]">
              {getParagraphs(content.paymentText).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </ThemedSectionCard>

          <ThemedSectionCard className="p-5 sm:p-6">
            <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
              Praktisk information
            </h2>

            <div className="mt-4 space-y-4 text-base font-normal leading-relaxed text-[var(--public-text)]">
              {getParagraphs(content.practicalText).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-6">
              <Link href={publicRoutes.contact(clubSlug)} className="public-secondary-button">
                {content.contactCtaLabel}
              </Link>
            </div>
          </ThemedSectionCard>
        </section>
      </div>
    </ThemedClubPageShell>
  );
}
