import { resolveClubContext } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../components/publicSite/ThemedBuildingBlocks";
import { requireActiveMemberForClub } from "../../../lib/auth/accessGuards";

interface ProfilePageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

/**
 * Placeholder for the future member profile page.
 * This route is now protected to require an ACTIVE member.
 */
export default async function ProfilePage({ params }: ProfilePageProps) {
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
      title="Min profil"
      currentPath={`/${clubSlug}/profil`}
    >
      <ThemedSectionCard>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg opacity-90 leading-relaxed">
            Medlemsprofil bliver tilføjet senere.
          </p>
        </div>
      </ThemedSectionCard>
    </ThemedClubPageShell>
  );
}
