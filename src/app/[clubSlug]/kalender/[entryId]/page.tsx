import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveClubContext } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { getPublicCalendarEntryDetail } from "../../../../lib/publicSite/publicCalendarService";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { publicRoutes } from "../../../../lib/publicRoutes";

interface PageProps {
  params: Promise<{
    clubSlug: string;
    entryId: string;
  }>;
}

export default async function CalendarDetailPage({ params }: PageProps) {
  const { clubSlug, entryId } = await params;
  const context = await resolveClubContext(clubSlug);
  const { club, theme, footerData, navigationItems, actionItems } = context;

  const entry = await getPublicCalendarEntryDetail(club.id, entryId);

  if (!entry) {
    notFound();
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('da-DK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('da-DK', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const timeDisplay = entry.startsAt.getHours() === 0 && entry.startsAt.getMinutes() === 0 
    ? "" 
    : `, kl. ${formatTime(entry.startsAt)}`;

  return (
    <ThemedClubPageShell
      clubSlug={clubSlug}
      clubName={club.settings?.shortName || club.name}
      clubDisplayName={club.settings?.displayName || club.name}
      logoUrl={club.settings?.logoUrl ?? null}
      logoAltText={club.settings?.logoAltText ?? null}
      theme={theme}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title={entry.title}
      eyebrow={`Kalender · ${formatDate(entry.startsAt)}${timeDisplay}`}
      currentPath={publicRoutes.calendarEntry(clubSlug, entryId)}
      maxWidth="1120px"
    >
      <div className="max-w-[800px] mx-auto">
        <ThemedSectionCard className="p-5 sm:p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-[var(--club-line)]">
            <div>
              <div className="text-[var(--club-muted)] text-sm mb-1">Dato & Tid</div>
              <div className="text-[var(--club-text)] font-medium">
                {formatDate(entry.startsAt)}
                {timeDisplay}
                {entry.endsAt && ` – ${formatTime(entry.endsAt)}`}
              </div>
            </div>
            {entry.location && (
              <div>
                <div className="text-[var(--club-muted)] text-sm mb-1">Lokation</div>
                <div className="text-[var(--club-text)] font-medium">{entry.location}</div>
              </div>
            )}
          </div>

          {entry.descriptionHtml ? (
            <div 
              className="calendar-detail-prose text-[var(--club-text)] text-base sm:text-lg leading-relaxed" 
              dangerouslySetInnerHTML={{ __html: entry.descriptionHtml }}
            />
          ) : (
            <p className="text-[var(--club-muted)] italic">Ingen yderligere beskrivelse.</p>
          )}

          <div className="mt-12 pt-8 border-t border-[var(--club-line)]">
            <Link 
              href={publicRoutes.home(clubSlug)}
              className="inline-flex items-center text-[var(--club-accent)] hover:underline font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Tilbage til forsiden
            </Link>
          </div>
        </ThemedSectionCard>
      </div>
    </ThemedClubPageShell>
  );
}
