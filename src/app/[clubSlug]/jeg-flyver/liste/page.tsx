import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import PublicClubShell from "../../../../components/publicSite/PublicClubShell";
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

  let club;
  try {
    club = await requireClubBySlug(clubSlug);
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }
    throw error;
  }

  const flightIntents = await getTodayFlightIntentList(club.id);

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
    <PublicClubShell club={club}>
      <div className="flex flex-col items-center justify-center p-6 text-slate-900 mt-12 mb-20">
        <div className="max-w-3xl w-full">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Jeg flyver
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Her kan du se dagens flyvemeldinger.
          </p>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {flightIntents.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {flightIntents.map((intent) => (
                  <div className="p-4 flex items-start gap-4" key={intent.id}>
                    <div className="text-2xl mt-1 shrink-0">
                      {activityIcons[intent.activityType] || '•'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-slate-900 truncate">
                          {intent.displayName}
                        </div>
                        <span className="shrink-0 text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                          {formatTime(intent.createdAt)}
                        </span>
                      </div>
                      {intent.message && (
                        <div className="mt-1 text-slate-600 italic">
                          “{intent.message}”
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="text-slate-400 text-5xl mb-4">✈️</div>
                <p className="text-slate-500 text-lg">
                  Der er endnu ingen flyvemeldinger for i dag.
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-8 flex justify-center">
            <a 
              href={`/${clubSlug}/jeg-flyver`}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Skriv jeg flyver
            </a>
          </div>
        </div>
      </div>
    </PublicClubShell>
  );
}
