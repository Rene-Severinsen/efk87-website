import { resolveClubContext } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { getTodayFlightIntentList } from "../../../../lib/publicSite/publicFlightIntentService";

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

  const { club, theme, footerData, navigationItems, actionItems, viewer } = await resolveClubContext(clubSlug);

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
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title="Jeg flyver"
      subtitle="Her kan du se dagens flyvemeldinger."
      currentPath={`/${clubSlug}/jeg-flyver/liste`}
      maxWidth="800px"
    >
      <ThemedSectionCard>
        {flightIntents.length > 0 ? (
          <div className="list">
            {flightIntents.map((intent) => (
              <div className="row-item" key={intent.id}>
                <div className="row-icon">
                  {activityIcons[intent.activityType] || '•'}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="row-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div className="row-title">
                      {intent.displayName}
                    </div>
                    <span className="status-badge info">
                      {formatTime(intent.createdAt)}
                    </span>
                  </div>
                  {intent.message && (
                    <div className="row-sub" style={{ marginTop: '0.25rem', fontStyle: 'italic', opacity: 0.8 }}>
                      “{intent.message}”
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.6 }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✈️</div>
            <p style={{ fontSize: '1.1rem' }}>
              Der er endnu ingen flyvemeldinger for i dag.
            </p>
          </div>
        )}
      </ThemedSectionCard>
      
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
        <a 
          href={`/${clubSlug}/jeg-flyver`}
          className="pill primary"
        >
          Skriv jeg flyver
        </a>
      </div>
    </ThemedClubPageShell>
  );
}
