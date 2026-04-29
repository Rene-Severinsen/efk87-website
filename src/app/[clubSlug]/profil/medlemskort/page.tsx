import { resolveClubContext } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { requireActiveMemberForClub } from "../../../../lib/auth/accessGuards";
import { getOrCreateOwnMemberProfile } from "../../../../lib/members/memberProfileService";
import { PrintableMemberCard } from "../../../../components/member/MemberCard/PrintableMemberCard";
import { MemberCardInstructions } from "../../../../components/member/MemberCard/MemberCardInstructions";
import { MemberCardTypeLegend } from "../../../../components/member/MemberCard/MemberCardTypeLegend";
import { MemberCardReference } from "../../../../components/member/MemberCard/MemberCardReference";

interface MemberCardPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function MemberCardPage({ params }: MemberCardPageProps) {
  const { clubSlug } = await params;

  const { club, theme, footerData, navigationItems, actionItems } = await resolveClubContext(clubSlug);

  // Ensure user is an active member and get viewer data
  const viewer = await requireActiveMemberForClub(club.id, club.slug, `/${clubSlug}/profil/medlemskort`);

  const profile = await getOrCreateOwnMemberProfile(club.id, viewer.userId!);

  // Card data
  const name = profile.firstName && profile.lastName 
    ? `${profile.firstName} ${profile.lastName}` 
    : (viewer.name || viewer.email || "Medlem");
  
  const currentYear = new Date().getFullYear();
  
  // Card status logic
  let status: 'plads' | 'elev' | 'passiv' | 'fallback' = 'fallback';
  if (profile.membershipType === 'PASSIVE') {
    status = 'passiv';
  } else if (profile.schoolStatus === 'APPROVED') {
    status = 'plads';
  } else if (profile.schoolStatus === 'STUDENT') {
    status = 'elev';
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
      title="Medlemskort"
      currentPath={`/${clubSlug}/profil/medlemskort`}
      maxWidth="1200px"
    >
      <div className="printable-content" style={{ background: 'white', padding: '2rem', color: 'black', borderRadius: '8px' }}>
        <PrintableMemberCard 
          name={name}
          year={currentYear}
          memberNumber={profile.memberNumber}
          status={status}
        />
        
        <MemberCardInstructions />
        
        <MemberCardReference />
        
        <MemberCardTypeLegend />
      </div>
    </ThemedClubPageShell>
  );
}
