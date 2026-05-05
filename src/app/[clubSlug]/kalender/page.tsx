import Link from "next/link";
import { resolveClubContext } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../components/publicSite/ThemedBuildingBlocks";
import { getPublicCalendarEntriesOverview } from "../../../lib/publicSite/publicCalendarService";
import { publicRoutes } from "../../../lib/publicRoutes";
import { getServerViewerForClub, toViewerVisibilityContext } from "../../../lib/auth/viewer";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("da-DK", {
    day: "2-digit",
    month: "short",
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

function formatDateTime(startsAt: Date, endsAt: Date | null) {
  const startTime = formatTime(startsAt);
  const endTime = endsAt ? formatTime(endsAt) : "";

  if (!startTime) {
    return formatDate(startsAt);
  }

  return endTime
    ? `${formatDate(startsAt)} · ${startTime}–${endTime}`
    : `${formatDate(startsAt)} · ${startTime}`;
}

export default async function CalendarOverviewPage({ params }: PageProps) {
  const { clubSlug } = await params;
  const context = await resolveClubContext(clubSlug);
  const { club, theme, footerData, navigationItems, actionItems } = context;

  const serverViewer = await getServerViewerForClub(club.id);
  const viewer = toViewerVisibilityContext(serverViewer);
  const entries = await getPublicCalendarEntriesOverview(club.id, viewer);

  const now = new Date();
  const upcomingEntries = entries.filter((entry) => entry.startsAt >= now);

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
      title="Kalender"
      subtitle="Samlet oversigt over klubbens kommende kalenderindslag."
      eyebrow="Kluboverblik"
      currentPath={publicRoutes.calendar(clubSlug)}
      maxWidth="1120px"
    >
      <div className="space-y-8">
        <ThemedSectionCard className="p-5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[var(--public-text)]">
                Kommende kalenderindslag
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--public-text-muted)] sm:text-base">
                Her vises kalenderindslag, som du har adgang til.
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full border border-[var(--public-card-border)] bg-[var(--public-primary-soft)] px-3 py-1 text-sm font-bold text-[var(--public-primary)]">
              {upcomingEntries.length} kommende
            </span>
          </div>
        </ThemedSectionCard>

        {upcomingEntries.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {upcomingEntries.map((entry) => (
              <Link
                key={entry.id}
                href={publicRoutes.calendarEntry(clubSlug, entry.id)}
                className="group no-underline"
              >
                <ThemedSectionCard className="flex h-full min-h-[178px] flex-col p-4 transition duration-200 group-hover:-translate-y-1 group-hover:shadow-xl">
                  <p className="text-[0.68rem] font-bold uppercase leading-snug tracking-[0.12em] text-[var(--public-primary)]">
                    {formatDateTime(entry.startsAt, entry.endsAt)}
                  </p>

                  <h2 className="mt-3 line-clamp-2 text-base font-bold leading-tight text-[var(--public-text)]">
                    {entry.title}
                  </h2>

                  {entry.location ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--public-text-muted)]">
                      {entry.location}
                    </p>
                  ) : null}

                  <div className="mt-auto pt-5">
                    <span className="inline-flex rounded-full border border-[var(--public-card-border)] bg-[var(--public-surface)] px-3 py-1 text-xs font-bold text-[var(--public-primary)] transition group-hover:border-[var(--public-primary)] group-hover:bg-[var(--public-primary-soft)]">
                      Se detaljer
                    </span>
                  </div>
                </ThemedSectionCard>
              </Link>
            ))}
          </div>
        ) : (
          <ThemedSectionCard className="p-8 text-center">
            <h2 className="text-xl font-bold text-[var(--public-text)]">
              Ingen kommende kalenderindslag
            </h2>
            <p className="mt-2 text-[var(--public-text-muted)]">
              Der er ikke publiceret kommende kalenderindslag lige nu.
            </p>
          </ThemedSectionCard>
        )}
      </div>
    </ThemedClubPageShell>
  );
}
