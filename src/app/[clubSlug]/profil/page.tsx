import { resolveClubContext } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { requireActiveMemberForClub } from "../../../lib/auth/accessGuards";
import { MemberProfile } from "../../../components/member/MemberProfile";
import { getOrCreateOwnMemberProfile } from "../../../lib/members/memberProfileService";

interface ProfilePageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

/**
 * Member profile page.
 * Renders the "Min profil" mockup with real viewer data.
 */
export default async function ProfilePage({ params }: ProfilePageProps) {
  const { clubSlug } = await params;

  const { club, theme, footerData, navigationItems, actionItems } = await resolveClubContext(clubSlug);

  // Ensure user is an active member and get viewer data
  const viewer = await requireActiveMemberForClub(club.id, club.slug, `/${clubSlug}/profil`);

  const profile = await getOrCreateOwnMemberProfile(club.id, viewer.userId!);

  return (
    <ThemedClubPageShell
      clubSlug={clubSlug}
      clubName={club.settings?.shortName || club.name}
      clubDisplayName={club.settings?.displayName || club.name}
      theme={theme}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title="Min profil"
      currentPath={`/${clubSlug}/profil`}
      maxWidth="1440px"
    >
      <MemberProfile 
        viewer={{
          userId: viewer.userId!,
          name: viewer.name || "Medlem",
          email: viewer.email || "",
          clubRole: viewer.clubRole || "Member",
          membershipStatus: viewer.membershipStatus || "Active",
        }}
        profile={profile}
      />
    </ThemedClubPageShell>
  );
}
