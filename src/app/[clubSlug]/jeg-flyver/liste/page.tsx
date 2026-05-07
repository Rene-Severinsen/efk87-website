import Link from "next/link";
import { resolveClubContext } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { getTodayFlightIntentList } from "../../../../lib/publicSite/publicFlightIntentService";
import Avatar from "../../../../components/shared/Avatar";
import { publicRoutes } from "../../../../lib/publicRoutes";

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
      logoUrl={publicSettings?.logoUrl ?? null}
      logoAltText={publicSettings?.logoAltText ?? null}
      theme={theme}
      publicThemeMode={publicSettings?.publicThemeMode}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title="Jeg flyver"
      subtitle="Her kan du se dagens flyvemeldinger."
      currentPath={publicRoutes.jegFlyverList(clubSlug)}
      maxWidth="800px"
    >
      <ThemedSectionCard className="p-4 sm:p-8">
        {flightIntents.length > 0 ? (
          <div className="list flex flex-col gap-3">
            {flightIntents.map((intent) => (
              <div className="row-item flex items-start gap-3 p-3 rounded-xl bg-[var(--public-surface)] border border-[var(--public-card-border)]" key={intent.id}>
                <div className="relative shrink-0">
                  <Avatar 
                    name={intent.displayName} 
                    imageUrl={intent.profileImageUrl} 
                    size="sm" 
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-[var(--public-card)] border border-[var(--public-card-border)] text-[10px] text-[var(--public-text)]">
                    {activityIcons[intent.activityType] || '•'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="row-item-header flex items-start justify-between gap-2">
                    <div className="row-title font-semibold text-sm sm:text-base truncate text-[var(--public-text)]">
                      {intent.displayName}
                    </div>
                    <span className="status-badge info shrink-0 text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-[var(--public-primary)]/20 text-[var(--public-primary)] font-medium">
                      {formatTime(intent.createdAt)}
                    </span>
                  </div>
                  {intent.message && (
                    <div className="row-sub mt-1 text-xs sm:text-sm italic leading-relaxed text-[var(--public-text-muted)] break-words">
                      “{intent.message}”
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-[var(--public-text-soft)]">
            <div className="text-4xl sm:text-5xl mb-4">✈️</div>
            <p className="text-base sm:text-lg">
              Der er endnu ingen flyvemeldinger for i dag.
            </p>
          </div>
        )}
      </ThemedSectionCard>
      
      <div className="mt-8 flex justify-center">
        <Link 
          href={publicRoutes.jegFlyver(clubSlug)}
          className="public-primary-button"
        >
          Skriv jeg flyver
        </Link>
      </div>
    </ThemedClubPageShell>
  );
}
