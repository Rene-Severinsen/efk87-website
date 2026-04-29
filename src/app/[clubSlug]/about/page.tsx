import { resolvePublicPageForClub } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../components/publicSite/ThemedBuildingBlocks";

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
      currentPath={`/${clubSlug}/about`}
    >
      <ThemedSectionCard className="p-5 sm:p-8">
        <div className="prose prose-invert max-w-none">
          <div className="text-base sm:text-lg opacity-90 leading-relaxed">
            {body}
          </div>
        </div>

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Kontakt</h3>
          <p className="text-sm sm:text-base text-slate-400 mb-6">
            Har du spørgsmål eller brug for hjælp? Find vores instruktører og kontaktpersoner her.
          </p>
          <a 
            href={`/${clubSlug}/om/kontakt`}
            className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-all text-sm sm:text-base font-semibold group"
          >
            Se instruktører
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </ThemedSectionCard>
    </ThemedClubPageShell>
  );
}
