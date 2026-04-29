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
      <ThemedSectionCard>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg opacity-90 leading-relaxed">
            {body}
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">Kontakt</h3>
          <p className="text-slate-400 mb-6">
            Har du spørgsmål eller brug for hjælp? Find vores instruktører og kontaktpersoner her.
          </p>
          <a 
            href={`/${clubSlug}/om/kontakt`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-all font-semibold group"
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
