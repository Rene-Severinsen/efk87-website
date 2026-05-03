import { resolveClubContext } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../components/publicSite/ThemedBuildingBlocks";
import "./JegFlyver.css";
import { requireActiveMemberForClub } from "../../../lib/auth/accessGuards";
import { ClubFlightIntentType, ClubFlightIntentStatus } from "../../../generated/prisma";
import { createFlightIntentAction } from "../../../lib/flightIntents/createFlightIntentAction";
import { cancelFlightIntentAction } from "../../../lib/flightIntents/cancelFlightIntentAction";
import { 
  getMemberRecentFlightIntents, 
  getActiveFlightIntentForMemberDate 
} from "../../../lib/flightIntents/memberFlightIntentService";
import { publicRoutes } from "../../../lib/publicRoutes";

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

  const { club, theme, footerData, navigationItems, actionItems, publicSettings } = await resolveClubContext(clubSlug);

  // Ensure user is an active member
  const viewer = await requireActiveMemberForClub(club.id, club.slug, publicRoutes.jegFlyver(clubSlug));

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
      publicThemeMode={publicSettings?.publicThemeMode}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title="Jeg flyver"
      subtitle={<span className="text-[var(--public-text-muted)] font-medium">Her kan medlemmer melde, at de tager ud på pladsen.</span>}
      currentPath={publicRoutes.jegFlyver(clubSlug)}
      maxWidth="800px"
    >
      <div className="jeg-flyver-container">
        <ThemedSectionCard className="premium-glass-card p-6 sm:p-10 border-none">
        {created === "1" && (
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-[var(--public-success)]/10 border border-[var(--public-success)]/30 text-[var(--public-success)] rounded-lg text-sm sm:text-base">
            Din flyvemelding er oprettet!
          </div>
        )}

        {cancelled === "1" && (
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-[var(--public-success)]/10 border border-[var(--public-success)]/30 text-[var(--public-success)] rounded-lg text-sm sm:text-base">
            Din melding er aflyst.
          </div>
        )}

        {duplicate === "1" && (
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-[var(--public-danger)]/10 border border-[var(--public-danger)]/30 text-[var(--public-danger)] rounded-lg text-sm sm:text-base">
            Du har allerede en aktiv &apos;Jeg flyver&apos;-melding for den valgte dag. Aflys den først, hvis du vil oprette en ny.
          </div>
        )}

        {hasActiveToday && (
          <div className="mb-5 sm:mb-6 p-3 bg-[var(--public-primary)]/10 border border-[var(--public-primary)]/30 text-[var(--public-primary)] text-sm rounded-lg">
            Du har allerede en aktiv melding for i dag.
          </div>
        )}

        <form action={createFlightIntentAction} className="space-y-6 sm:space-y-8">
          <input type="hidden" name="clubSlug" value={clubSlug} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="flightDate" className="block text-sm font-semibold text-[var(--public-text)] mb-2.5">
                Dato <span className="text-[var(--public-danger)] opacity-70">*</span>
              </label>
              <input
                type="date"
                id="flightDate"
                name="flightDate"
                required
                defaultValue={todayStr}
                min={todayStr}
                className="premium-input w-full px-4 py-2.5 rounded-xl shadow-sm focus:ring-2 focus:ring-[var(--public-primary)]/30"
              />
            </div>

            <div>
              <label htmlFor="plannedTime" className="block text-sm font-semibold text-[var(--public-text)] mb-2.5">
                Forventet tidspunkt
              </label>
              <input
                type="time"
                id="plannedTime"
                name="plannedTime"
                className="premium-input w-full px-4 py-2.5 rounded-xl shadow-sm focus:ring-2 focus:ring-[var(--public-primary)]/30"
              />
            </div>
          </div>

          <div>
            <label htmlFor="activityType" className="block text-sm font-semibold text-[var(--public-text)] mb-2.5">
              Aktivitetstype <span className="text-[var(--public-danger)] opacity-70">*</span>
            </label>
            <select
              id="activityType"
              name="activityType"
              required
              defaultValue={ClubFlightIntentType.FLYING}
              className="premium-input w-full px-4 py-2.5 rounded-xl shadow-sm focus:ring-2 focus:ring-[var(--public-primary)]/30 appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
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
            <label htmlFor="message" className="block text-sm font-semibold text-[var(--public-text)] mb-2.5">
              Besked <span className="text-[var(--public-text-muted)] font-normal text-xs ml-1">(valgfrit, max 240 tegn)</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={3}
              maxLength={240}
              placeholder="F.eks. hvilke fly du tager med, eller om der er noget specielt..."
              className="premium-input w-full px-4 py-2.5 rounded-xl shadow-sm focus:ring-2 focus:ring-[var(--public-primary)]/30 placeholder-[var(--public-text-soft)]"
            ></textarea>
          </div>

          <button
            type="submit"
            className="premium-button w-full flex justify-center items-center py-3.5 px-6 border border-transparent rounded-xl shadow-xl text-base font-bold text-white bg-gradient-to-r from-[var(--public-primary)] to-[var(--public-primary-soft)] hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Meld ankomst
          </button>
        </form>

        <div className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-white/5">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-[var(--public-text)] flex items-center gap-3">
            <span className="w-1.5 h-8 bg-[var(--public-primary)] rounded-full"></span>
            Dine seneste meldinger
          </h2>
          
          {recentIntents.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/5">
              <p className="italic text-[var(--public-text-soft)]">
                Du har endnu ikke oprettet nogen &apos;Jeg flyver&apos;-meldinger.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentIntents.map((intent) => (
                <div 
                  key={intent.id} 
                  className={`p-4 sm:p-6 rounded-2xl intent-card ${
                    intent.status === ClubFlightIntentStatus.CANCELLED ? 'cancelled' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="font-bold text-base sm:text-lg text-[var(--public-text)] flex items-center gap-2">
                      <span className="opacity-70">
                        {new Date(intent.flightDate).toLocaleDateString("da-DK", { 
                          weekday: 'short', 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </span>
                      {intent.plannedAt && (
                        <span className="text-sm font-medium px-2 py-0.5 rounded-md bg-white/10 text-[var(--public-text-muted)]">
                          kl. {new Date(intent.plannedAt).toLocaleTimeString("da-DK", { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg ${
                      intent.status === ClubFlightIntentStatus.ACTIVE ? 'status-badge-active' : 
                      intent.status === ClubFlightIntentStatus.CANCELLED ? 'status-badge-cancelled' :
                      'bg-white/10 text-[var(--public-text-soft)]'
                    }`}>
                      {getFlightIntentStatusLabel(intent.status)}
                    </span>
                  </div>
                  <div className="flex justify-between items-end gap-4">
                    <div className="flex-1">
                      <div className="text-base mb-2">
                        <span className="font-semibold text-[var(--public-text)]">{getActivityLabel(intent.activityType)}</span>
                      </div>
                      {intent.message && (
                        <div className="text-sm italic text-[var(--public-text-muted)] leading-relaxed">
                          &ldquo;{intent.message}&rdquo;
                        </div>
                      )}
                    </div>

                    {intent.status === ClubFlightIntentStatus.ACTIVE && (
                      <form action={cancelFlightIntentAction} className="flex-shrink-0">
                        <input type="hidden" name="clubSlug" value={clubSlug} />
                        <input type="hidden" name="flightIntentId" value={intent.id} />
                        <button 
                          type="submit"
                          className="premium-button text-xs font-bold px-4 py-2 bg-[var(--public-danger)]/10 hover:bg-[var(--public-danger)]/20 text-[var(--public-danger)] border border-[var(--public-danger)]/20 rounded-xl transition-all active:scale-95"
                        >
                          Aflys
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-8 text-[var(--public-text-soft)] opacity-60">
                <div className="w-1 h-1 rounded-full bg-current"></div>
                <p className="text-[10px] uppercase tracking-widest font-bold">
                  Redigering er planlagt til en fremtidig opdatering
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 pt-10 border-t border-white/5 text-center">
          <p className="text-sm font-medium text-[var(--public-text-soft)] opacity-60">
            Dagens offentlige aktivitetsliste vises på forsiden.
          </p>
        </div>
      </ThemedSectionCard>
      </div>
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

function getFlightIntentStatusLabel(status: ClubFlightIntentStatus): string {
  switch (status) {
    case ClubFlightIntentStatus.ACTIVE: return "Aktiv";
    case ClubFlightIntentStatus.CANCELLED: return "Aflyst";
    case ClubFlightIntentStatus.EXPIRED: return "Udløbet";
    default: return status;
  }
}
