import { resolveClubContext } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { getTodayFlightIntentList } from "../../../../lib/publicSite/publicFlightIntentService";
import Avatar from "../../../../components/shared/Avatar";

interface JegFlyverListePageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

/**
 * Public read-only list of today's flight intents.
 */
export default async function JegFlyverListePage({ params }: JegFlyverListePageProps) {
  const { clubSlug } = await params;

  const { club, theme, footerData, navigationItems, actionItems, viewer, publicSettings } = await resolveClubContext(clubSlug);

  const flightIntents = await getTodayFlightIntentList(club.id, viewer);

  const activityIcons: Record<string, string> = {
    FLYING: '✈️',
    MAINTENANCE: '🛠️',
    WEATHER_DEPENDENT: '🌬️',
    TRAINING: '🎓',
    SOCIAL: '☕',
    OTHER: '•',
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('da-DK', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(date));
  };

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
      title="Jeg flyver"
      subtitle="Her kan du se dagens flyvemeldinger."
      currentPath={`/${clubSlug}/jeg-flyver/liste`}
      maxWidth="800px"
    >
      <ThemedSectionCard className="p-4 sm:p-8">
        {flightIntents.length > 0 ? (
          <div className="list flex flex-col gap-3">
            {flightIntents.map((intent) => (
              <div className="row-item flex items-center gap-3 p-3 rounded-xl bg-[var(--club-panel-soft)] border border-[var(--club-line)]" key={intent.id}>
                <div className="relative shrink-0">
                  <Avatar 
                    name={intent.displayName} 
                    imageUrl={intent.profileImageUrl} 
                    size="sm" 
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-[var(--club-panel)] border border-[var(--club-line)] text-[10px]">
                    {activityIcons[intent.activityType] || '•'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="row-item-header flex justify-between items-center gap-2">
                    <div className="row-title font-semibold text-sm sm:text-base truncate">
                      {intent.displayName}
                    </div>
                    <span className="status-badge info text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-medium">
                      {formatTime(intent.createdAt)}
                    </span>
                  </div>
                  {intent.message && (
                    <div className="row-sub mt-1 text-xs sm:text-sm italic opacity-70 truncate">
                      “{intent.message}”
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center opacity-60">
            <div className="text-4xl sm:text-5xl mb-4">✈️</div>
            <p className="text-base sm:text-lg">
              Der er endnu ingen flyvemeldinger for i dag.
            </p>
          </div>
        )}
      </ThemedSectionCard>
      
      <div className="mt-8 flex justify-center">
        <a 
          href={`/${clubSlug}/jeg-flyver`}
          className="pill primary px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all hover:scale-[1.02]"
        >
          Skriv jeg flyver
        </a>
      </div>
    </ThemedClubPageShell>
  );
}
