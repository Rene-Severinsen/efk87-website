import { resolveClubContext } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../components/publicSite/ThemedBuildingBlocks";
import { requireActiveMemberForClub } from "../../../lib/auth/accessGuards";
import { ClubFlightIntentType, ClubFlightIntentStatus } from "../../../generated/prisma";
import { createFlightIntentAction } from "../../../lib/flightIntents/createFlightIntentAction";
import { cancelFlightIntentAction } from "../../../lib/flightIntents/cancelFlightIntentAction";
import { 
  getMemberRecentFlightIntents, 
  getActiveFlightIntentForMemberDate 
} from "../../../lib/flightIntents/memberFlightIntentService";

interface JegFlyverPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
  searchParams: Promise<{
    created?: string;
    cancelled?: string;
    duplicate?: string;
  }>;
}

/**
 * "Jeg flyver" submission page for members.
 */
export default async function JegFlyverPage({ params, searchParams }: JegFlyverPageProps) {
  const { clubSlug } = await params;
  const { created, cancelled, duplicate } = await searchParams;

  const { club, theme, footerData, navigationItems, actionItems } = await resolveClubContext(clubSlug);

  // Ensure user is an active member
  const viewer = await requireActiveMemberForClub(club.id, club.slug, `/${clubSlug}/jeg-flyver`);

  const recentIntents = await getMemberRecentFlightIntents(club.id, viewer);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Check if member already has an active entry for today
  const hasActiveToday = await getActiveFlightIntentForMemberDate(club.id, viewer.userId!, today);

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
      subtitle="Her kan medlemmer melde, at de tager ud på pladsen."
      currentPath={`/${clubSlug}/jeg-flyver`}
      maxWidth="800px"
    >
      <ThemedSectionCard className="p-4 sm:p-8">
        {created === "1" && (
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-green-900/30 border border-green-500/50 text-green-200 rounded-lg text-sm sm:text-base">
            Din flyvemelding er oprettet!
          </div>
        )}

        {cancelled === "1" && (
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-green-900/30 border border-green-500/50 text-green-200 rounded-lg text-sm sm:text-base">
            Din melding er aflyst.
          </div>
        )}

        {duplicate === "1" && (
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-red-600 border border-red-500 text-white rounded-lg text-sm sm:text-base">
            Du har allerede en aktiv &apos;Jeg flyver&apos;-melding for den valgte dag. Aflys den først, hvis du vil oprette en ny.
          </div>
        )}

        {hasActiveToday && (
          <div className="mb-5 sm:mb-6 p-3 bg-blue-900/20 border border-blue-500/30 text-blue-200 text-sm rounded-lg">
            Du har allerede en aktiv melding for i dag.
          </div>
        )}

        <form action={createFlightIntentAction} className="space-y-4 sm:space-y-6">
          <input type="hidden" name="clubSlug" value={clubSlug} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="flightDate" className="block text-sm font-medium opacity-80 mb-2">
                Dato *
              </label>
              <input
                type="date"
                id="flightDate"
                name="flightDate"
                required
                defaultValue={todayStr}
                min={todayStr}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
              />
            </div>

            <div>
              <label htmlFor="plannedTime" className="block text-sm font-medium opacity-80 mb-2">
                Forventet tidspunkt (valgfrit)
              </label>
              <input
                type="time"
                id="plannedTime"
                name="plannedTime"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="activityType" className="block text-sm font-medium opacity-80 mb-2">
              Aktivitetstype *
            </label>
            <select
              id="activityType"
              name="activityType"
              required
              defaultValue={ClubFlightIntentType.FLYING}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
              style={{ colorScheme: 'dark' }}
            >
              <option value={ClubFlightIntentType.FLYING}>Flyvning</option>
              <option value={ClubFlightIntentType.TRAINING}>Skoleflyvning / Træning</option>
              <option value={ClubFlightIntentType.MAINTENANCE}>Vedligeholdelse</option>
              <option value={ClubFlightIntentType.WEATHER_DEPENDENT}>Vejrafhængig flyvning</option>
              <option value={ClubFlightIntentType.SOCIAL}>Socialt samvær</option>
              <option value={ClubFlightIntentType.OTHER}>Andet</option>
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium opacity-80 mb-2">
              Besked (valgfrit, max 240 tegn)
            </label>
            <textarea
              id="message"
              name="message"
              rows={3}
              maxLength={240}
              placeholder="F.eks. hvilke fly du tager med, eller om der er noget specielt..."
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-white/20"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm sm:text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Meld ankomst
          </button>
        </form>

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/5">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Dine seneste meldinger</h2>
          
          {recentIntents.length === 0 ? (
            <p className="opacity-50 italic text-sm">
              Du har endnu ikke oprettet nogen &apos;Jeg flyver&apos;-meldinger.
            </p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {recentIntents.map((intent) => (
                <div key={intent.id} className="p-3 sm:p-4 rounded-lg border border-white/5 bg-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-sm sm:text-base">
                      {new Date(intent.flightDate).toLocaleDateString("da-DK", { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                      {intent.plannedAt && (
                        <span className="ml-2 opacity-60">
                          kl. {new Date(intent.plannedAt).toLocaleTimeString("da-DK", { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      intent.status === ClubFlightIntentStatus.ACTIVE ? 'bg-green-500/20 text-green-400' : 
                      intent.status === ClubFlightIntentStatus.CANCELLED ? 'bg-red-500/20 text-red-400' :
                      'bg-white/10 text-white/50'
                    }`}>
                      {intent.status === ClubFlightIntentStatus.CANCELLED ? 'AFLYST' : intent.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="flex-1">
                      <div className="text-sm opacity-90 mb-1">
                        <span className="font-semibold">{getActivityLabel(intent.activityType)}</span>
                      </div>
                      {intent.message && (
                        <div className="text-sm opacity-70 italic">
                          &ldquo;{intent.message}&rdquo;
                        </div>
                      )}
                    </div>

                    {intent.status === ClubFlightIntentStatus.ACTIVE && (
                      <form action={cancelFlightIntentAction}>
                        <input type="hidden" name="clubSlug" value={clubSlug} />
                        <input type="hidden" name="flightIntentId" value={intent.id} />
                        <button 
                          type="submit"
                          className="text-xs px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 rounded transition-colors"
                        >
                          Aflys
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
              <p className="text-xs opacity-40 mt-6">
                Redigering er planlagt til en fremtidig opdatering.
              </p>
            </div>
          )}
        </div>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <p className="text-sm opacity-50 italic">
            Dagens offentlige aktivitetsliste vises på forsiden.
          </p>
        </div>
      </ThemedSectionCard>
    </ThemedClubPageShell>
  );
}

function getActivityLabel(type: ClubFlightIntentType): string {
  switch (type) {
    case ClubFlightIntentType.FLYING: return "Flyvning";
    case ClubFlightIntentType.TRAINING: return "Skoleflyvning / Træning";
    case ClubFlightIntentType.MAINTENANCE: return "Vedligeholdelse";
    case ClubFlightIntentType.WEATHER_DEPENDENT: return "Vejrafhængig flyvning";
    case ClubFlightIntentType.SOCIAL: return "Socialt samvær";
    case ClubFlightIntentType.OTHER: return "Andet";
    default: return type;
  }
}
