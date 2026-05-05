import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveClubContext } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { getPublicCalendarEntryDetail } from "../../../../lib/publicSite/publicCalendarService";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { publicRoutes } from "../../../../lib/publicRoutes";
import { getServerViewerForClub, toViewerVisibilityContext } from "../../../../lib/auth/viewer";

interface PageProps {
  params: Promise<{
    clubSlug: string;
    entryId: string;
  }>;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date: Date) {
  if (date.getHours() === 0 && date.getMinutes() === 0) {
    return "";
  }

  return date.toLocaleTimeString("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function CalendarDetailPage({ params }: PageProps) {
  const { clubSlug, entryId } = await params;
  const context = await resolveClubContext(clubSlug);
  const { club, theme, footerData, navigationItems, actionItems } = context;

  const serverViewer = await getServerViewerForClub(club.id);
  const viewer = toViewerVisibilityContext(serverViewer);
  const entry = await getPublicCalendarEntryDetail(club.id, entryId, viewer);

  if (!entry) {
    notFound();
  }

  const startTime = formatTime(entry.startsAt);
  const endTime = entry.endsAt ? formatTime(entry.endsAt) : "";
  const timeDisplay = startTime
    ? endTime
      ? `${startTime}–${endTime}`
      : startTime
    : "Heldagsindslag";

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
      eyebrow={`Kalender · ${formatDate(entry.startsAt)}${startTime ? `, kl. ${startTime}` : ""}`}
      currentPath={publicRoutes.calendarEntry(clubSlug, entryId)}
      maxWidth="960px"
    >
      <div className="space-y-6">
        <ThemedSectionCard className="p-5 sm:p-8 md:p-10">
          <div className="grid grid-cols-1 gap-5 border-b border-[var(--public-card-border)] pb-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--public-primary)]">
                Dato
              </p>
              <p className="mt-2 text-lg font-bold text-[var(--public-text)]">
                {formatDate(entry.startsAt)}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--public-primary)]">
                Tid
              </p>
              <p className="mt-2 text-lg font-bold text-[var(--public-text)]">
                {timeDisplay}
              </p>
            </div>

            {entry.location ? (
              <div className="sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--public-primary)]">
                  Lokation
                </p>
                <p className="mt-2 text-lg font-bold text-[var(--public-text)]">
                  {entry.location}
                </p>
              </div>
            ) : null}
          </div>

          {entry.descriptionHtml ? (
            <div
              className="calendar-detail-prose mt-8 text-base leading-relaxed text-[var(--public-text)] sm:text-lg"
              dangerouslySetInnerHTML={{ __html: entry.descriptionHtml }}
            />
          ) : (
            <p className="mt-8 text-base italic text-[var(--public-text-muted)]">
              Ingen yderligere beskrivelse.
            </p>
          )}

          <div className="mt-10 border-t border-[var(--public-card-border)] pt-6">
            <Link
              href={publicRoutes.calendar(clubSlug)}
              className="inline-flex items-center rounded-full border border-[var(--public-card-border)] bg-[var(--public-surface)] px-4 py-2 text-sm font-bold text-[var(--public-primary)] no-underline transition hover:border-[var(--public-primary)] hover:bg-[var(--public-primary-soft)]"
            >
              ← Tilbage til kalenderen
            </Link>
          </div>
        </ThemedSectionCard>
      </div>
    </ThemedClubPageShell>
  );
}
