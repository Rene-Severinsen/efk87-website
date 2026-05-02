import { resolveClubContext } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { listPublishedSessionsFromTodayView, FlightSchoolCalendarSessionView } from "../../../../lib/flightSchool/flightSchoolBookingService";
import { getServerViewerForClub } from "../../../../lib/auth/viewer";
import { format, startOfDay, isSameDay } from "date-fns";
import { da } from "date-fns/locale";
import FlightSchoolCalendarClient from "./FlightSchoolCalendarClient";
import { getMemberProfileId } from "../../../../lib/members/memberProfileService";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function SkolekalenderPage({ params }: PageProps) {
  const { clubSlug } = await params;
  const { club, theme, footerData, navigationItems, actionItems, publicSettings } = await resolveClubContext(clubSlug);
  const viewer = await getServerViewerForClub(club.id);

  // Get member profile for the viewer to identify their own bookings
  let memberProfileId: string | null = null;
  if (viewer.userId) {
    memberProfileId = await getMemberProfileId(club.id, viewer.userId);
  }

  const sessions = await listPublishedSessionsFromTodayView(club.id, memberProfileId);

  // Group sessions by date
  const groupedSessions: Record<string, FlightSchoolCalendarSessionView[]> = {};
  sessions.forEach((session) => {
    const dateKey = startOfDay(session.date).toISOString();
    if (!groupedSessions[dateKey]) {
      groupedSessions[dateKey] = [];
    }
    groupedSessions[dateKey].push(session);
  });

  const sortedDates = Object.keys(groupedSessions).sort();

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
      title="Skolekalender"
      eyebrow="Flyveskole"
      currentPath={`/${clubSlug}/flyveskole/skolekalender`}
    >
      <div className="space-y-8">
        <ThemedSectionCard>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-lg opacity-80">
                Book en ledig skoletid hos en af klubbens instruktører.
              </p>
            </div>
            {!viewer.isMember && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-200 text-sm">
                Du skal være logget ind som medlem for at booke en skoletid.
              </div>
            )}
          </div>
        </ThemedSectionCard>

        {sortedDates.length === 0 ? (
          <ThemedSectionCard>
            <div className="py-12 text-center opacity-60">
              Der er ingen planlagte skoletider i kalenderen lige nu.
            </div>
          </ThemedSectionCard>
        ) : (
          <div className="space-y-12">
            {sortedDates.map((dateIso) => {
              const date = new Date(dateIso);
              const daySessions = groupedSessions[dateIso];

              return (
                <section key={dateIso}>
                  <h2 className="text-xl font-bold mb-6 px-1 text-white border-b border-white/10 pb-2 flex items-baseline gap-3">
                    <span className="capitalize">{format(date, "EEEE 'd.' d. MMMM", { locale: da })}</span>
                    {isSameDay(date, new Date()) && (
                      <span className="text-xs uppercase tracking-wider bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-bold">I dag</span>
                    )}
                  </h2>

                  <div className="grid grid-cols-1 gap-6">
                    {daySessions.map((session) => (
                      <div 
                        key={session.id}
                        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                      >
                        <div className="p-5 border-b border-white/5 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="text-sm opacity-50 uppercase tracking-wider font-semibold mb-1">Instruktør</div>
                            <div className="font-bold text-lg text-white">{session.instructor.firstName} {session.instructor.lastName}</div>
                          </div>
                          <div className="text-right sm:text-right">
                            <div className="text-sm opacity-50 uppercase tracking-wider font-semibold mb-1">Tidsrum</div>
                            <div className="font-medium text-white/90">
                              {session.startsAt ? format(session.startsAt, "HH:mm") : "??"} - {session.endsAt ? format(session.endsAt, "HH:mm") : "??"}
                            </div>
                          </div>
                        </div>

                        {session.note && (
                          <div className="px-5 py-3 bg-sky-500/5 text-sky-200/80 text-sm border-b border-white/5 italic">
                            {session.note}
                          </div>
                        )}

                        <div className="p-5">
                          <FlightSchoolCalendarClient 
                            session={session} 
                            clubId={club.id} 
                            clubSlug={clubSlug}
                            isMember={viewer.isMember}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </ThemedClubPageShell>
  );
}
