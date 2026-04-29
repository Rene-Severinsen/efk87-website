import { resolveClubContext } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../components/publicSite/ThemedBuildingBlocks";
import { requireActiveMemberForClub } from "../../../lib/auth/accessGuards";

interface ForumPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

/**
 * Placeholder for the future member forum.
 * This route is now protected to require an ACTIVE member.
 */
export default async function ForumPage({ params }: ForumPageProps) {
  const { clubSlug } = await params;

  const { club, theme, footerData, navigationItems, actionItems } = await resolveClubContext(clubSlug);

  // Ensure user is an active member
  await requireActiveMemberForClub(club.id, club.slug);

  return (
    <ThemedClubPageShell
      clubName={club.settings?.shortName || club.name}
      clubDisplayName={club.settings?.displayName || club.name}
      theme={theme}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title="Forum"
      currentPath={`/${clubSlug}/forum`}
    >
      <ThemedSectionCard>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg opacity-90 leading-relaxed">
            Forum bliver tilføjet senere.
          </p>
        </div>
      </ThemedSectionCard>
    </ThemedClubPageShell>
  );
}
