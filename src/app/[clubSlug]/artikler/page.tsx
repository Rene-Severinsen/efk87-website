import { notFound } from "next/navigation";
import { resolvePublicPageForClub } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../components/publicSite/ThemedBuildingBlocks";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function ArtiklerPage({ params }: PageProps) {
  const { clubSlug } = await params;
  const pageSlug = "artikler";
  const { club, page, theme, footerData, navigationItems, actionItems } = await resolvePublicPageForClub(clubSlug, pageSlug);

  if (!page) {
    notFound();
  }

  return (
    <ThemedClubPageShell
      clubSlug={clubSlug}
      clubName={club.settings?.shortName || club.name}
      clubDisplayName={club.settings?.displayName || club.name}
      theme={theme}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title={page.title}
      currentPath={`/${clubSlug}/artikler`}
    >
      <ThemedSectionCard>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg opacity-90 leading-relaxed">
            {page.body}
          </p>
        </div>
      </ThemedSectionCard>
    </ThemedClubPageShell>
  );
}
