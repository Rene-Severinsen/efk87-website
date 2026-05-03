import { resolvePublicPageForClub } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";

interface MembersPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { clubSlug } = await params;
  const pageSlug = "members";
  const { 
    club, 
    page, 
    theme, 
    footerData, 
    navigationItems, 
    actionItems, 
    publicSettings 
  } = await resolvePublicPageForClub(clubSlug, pageSlug);

  const title = page?.title || "Medlemmer";
  const body = page?.body || "Her kan du se klubbens medlemmer.";

  return (
    <ThemedClubPageShell
      clubSlug={clubSlug}
      clubName={club.name}
      clubDisplayName={publicSettings?.displayName || club.name}
      theme={theme}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title={title}
      currentPath={`/${clubSlug}/${pageSlug}`}
    >
      <div className="bg-[var(--club-panel)] border border-[var(--club-line)] rounded-[var(--club-radius)] p-8 shadow-[var(--club-shadow)]">
        <p className="text-[var(--club-text)] text-lg">
          {body}
        </p>
      </div>
    </ThemedClubPageShell>
  );
}
