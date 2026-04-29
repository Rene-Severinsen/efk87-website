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
      </ThemedSectionCard>
    </ThemedClubPageShell>
  );
}
