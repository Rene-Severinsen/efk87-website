import { resolveClubContext } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { requireActiveMemberForClub } from "../../../lib/auth/accessGuards";
import { MemberProfile } from "../../../components/member/MemberProfile";
import { getOrCreateOwnMemberProfile } from "../../../lib/members/memberProfileService";
import { getActiveClubMailingLists } from "../../../lib/mailingLists/clubMailingListService";
import { publicRoutes } from "../../../lib/publicRoutes";

interface ProfilePageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

/**
 * Member profile page.
 * Renders member profile with viewer data.
 */
export default async function ProfilePage({ params }: ProfilePageProps) {
  const { clubSlug } = await params;

  const { club, theme, footerData, navigationItems, actionItems, publicSettings } = await resolveClubContext(clubSlug);

  // Ensure user is an active member and get viewer data
  const viewer = await requireActiveMemberForClub(club.id, club.slug, publicRoutes.profile(clubSlug));

  const profile = await getOrCreateOwnMemberProfile(club.id, viewer.userId!);
  const mailingLists = await getActiveClubMailingLists(club.id);

  return (
    <ThemedClubPageShell
      clubSlug={clubSlug}
      clubName={club.settings?.shortName || club.name}
      clubDisplayName={club.settings?.displayName || club.name}
      theme={theme}
      publicThemeMode={publicSettings?.publicThemeMode}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title="Min profil"
      currentPath={publicRoutes.profile(clubSlug)}
      maxWidth="1440px"
    >
      <MemberProfile 
        clubId={club.id}
        clubSlug={clubSlug}
        viewer={{
          userId: viewer.userId!,
          name: viewer.name || "Medlem",
          email: viewer.email || "",
          clubRole: viewer.clubRole || "Member",
          membershipStatus: viewer.membershipStatus || "Active",
        }}
        profile={profile}
        mailingLists={mailingLists}
      />
    </ThemedClubPageShell>
  );
}
