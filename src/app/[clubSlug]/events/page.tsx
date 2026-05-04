import { resolveClubContext } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { publicRoutes } from "../../../lib/publicRoutes";

interface EventsPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function EventsPage({ params }: EventsPageProps) {
  const { clubSlug } = await params;
  
  const { 
    club, 
    theme, 
    footerData, 
    navigationItems, 
    actionItems, 
    publicSettings 
  } = await resolveClubContext(clubSlug);

  return (
    <ThemedClubPageShell
      clubSlug={clubSlug}
      clubName={club.name}
      clubDisplayName={publicSettings?.displayName || club.name}
      logoUrl={publicSettings?.logoUrl ?? null}
      logoAltText={publicSettings?.logoAltText ?? null}
      theme={theme}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title="Begivenheder"
      currentPath={publicRoutes.events(clubSlug)}
    >
      <div className="bg-[var(--club-panel)] border border-[var(--club-line)] rounded-[var(--club-radius)] p-8 shadow-[var(--club-shadow)]">
        <p className="text-[var(--club-text)] text-lg">
          Klubbens begivenheder vil blive vist her.
        </p>
      </div>
    </ThemedClubPageShell>
  );
}
