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
  const { club, page, theme, footerData, navigationItems, actionItems } = await resolvePublicPageForClub(clubSlug, pageSlug);

  const title = page?.title ?? `Om ${club.settings?.shortName || club.name}`;
  const body = page?.body ?? "Information om klubben vil snart være tilgængelig.";

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
      <ThemedSectionCard className="p-5 sm:p-8">
        <div className="prose prose-invert max-w-none">
          <div className="text-base sm:text-lg opacity-90 leading-relaxed">
            {body}
          </div>
        </div>

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-[var(--public-card-border)]">
          <h3 className="text-lg sm:text-xl font-bold text-[var(--club-text)] mb-3 sm:mb-4">Kontakt</h3>
          <p className="text-sm sm:text-base text-[var(--public-text-soft)] mb-6">
            Har du spørgsmål eller brug for hjælp? Find vores instruktører og kontaktpersoner her.
          </p>
          <Link 
            href={publicRoutes.contact(clubSlug)}
            className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-[var(--public-primary-soft)] hover:bg-[var(--public-primary-soft)] hover:opacity-90 text-[var(--public-primary)] border border-[var(--public-card-border)] transition-all text-sm sm:text-base font-semibold group"
          >
            Se instruktører
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </ThemedSectionCard>
    </ThemedClubPageShell>
  );
}
