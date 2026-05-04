import { resolvePublicPageForClub } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { publicRoutes } from "../../../../lib/publicRoutes";
import { getClubStatistics } from "../../../../lib/statistics/statisticsService";

interface StatisticsPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

function KpiCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number | string;
  helper?: string;
}) {
  return (
    <ThemedSectionCard className="p-5 sm:p-6">
      <p className="text-sm font-semibold text-[var(--public-text-muted)]">
        {label}
      </p>

      <p className="mt-2 text-4xl font-bold tracking-tight text-[var(--public-primary)]">
        {value}
      </p>

      {helper ? (
        <p className="mt-2 text-sm font-normal leading-relaxed text-[var(--public-text-muted)]">
          {helper}
        </p>
      ) : null}
    </ThemedSectionCard>
  );
}

function getLinePoints(values: number[], width: number, height: number, padding: number): string {
  const maxValue = Math.max(...values, 1);
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const step = values.length > 1 ? usableWidth / (values.length - 1) : usableWidth;

  return values
    .map((value, index) => {
      const x = padding + index * step;
      const y = padding + usableHeight - (value / maxValue) * usableHeight;

      return `${x},${y}`;
    })
    .join(" ");
}

function ActivityLineChart({
  points,
}: {
  points: { label: string; flightIntents: number; uniqueLogins: number }[];
}) {
  const width = 900;
  const height = 280;
  const padding = 34;
  const allValues = points.flatMap((point) => [point.flightIntents, point.uniqueLogins]);
  const maxValue = Math.max(...allValues, 1);
  const flightIntentPoints = getLinePoints(
    points.map((point) => point.flightIntents),
    width,
    height,
    padding,
  );
  const uniqueLoginPoints = getLinePoints(
    points.map((point) => point.uniqueLogins),
    width,
    height,
    padding,
  );

  return (
    <ThemedSectionCard className="p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
          Aktivitet seneste 14 dage
        </h2>
        <p className="mt-2 text-sm font-normal leading-relaxed text-[var(--public-text-muted)] sm:text-base">
          Flyvemeldinger og unikke logins pr. dag.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 text-sm font-semibold">
        <div className="flex items-center gap-2 text-[var(--public-text)]">
          <span className="h-3 w-3 rounded-full bg-[var(--public-primary)]" />
          Flyvemeldinger
        </div>
        <div className="flex items-center gap-2 text-[var(--public-text)]">
          <span className="h-3 w-3 rounded-full border border-[var(--public-primary)] bg-[var(--public-card)]" />
          Unikke logins
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[760px]"
          role="img"
          aria-label="Aktivitet seneste 14 dage"
        >
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="var(--public-card-border)"
            strokeWidth="2"
          />

          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke="var(--public-card-border)"
            strokeWidth="2"
          />

          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding + (height - padding * 2) * ratio;
            const value = Math.round(maxValue * (1 - ratio));

            return (
              <g key={ratio}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="var(--public-card-border)"
                  strokeWidth="1"
                  opacity="0.55"
                />
                <text
                  x={padding - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-[var(--public-text-muted)] text-[11px]"
                >
                  {value}
                </text>
              </g>
            );
          })}

          <polyline
            points={uniqueLoginPoints}
            fill="none"
            stroke="var(--public-text-muted)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="8 8"
          />

          <polyline
            points={flightIntentPoints}
            fill="none"
            stroke="var(--public-primary)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point, index) => {
            const usableWidth = width - padding * 2;
            const step = points.length > 1 ? usableWidth / (points.length - 1) : usableWidth;
            const x = padding + index * step;

            return (
              <g key={point.label}>
                <text
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-[var(--public-text-muted)] text-[11px]"
                >
                  {point.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </ThemedSectionCard>
  );
}


function MembershipDevelopmentChart({
  points,
}: {
  points: { label: string; joined: number; left: number; net: number }[];
}) {
  const width = 900;
  const height = 280;
  const paddingTop = 28;
  const paddingRight = 24;
  const paddingBottom = 42;
  const paddingLeft = 40;
  const maxValue = Math.max(...points.map((point) => Math.max(point.joined, point.left)), 1);
  const usableWidth = width - paddingLeft - paddingRight;
  const usableHeight = height - paddingTop - paddingBottom;
  const slotWidth = usableWidth / points.length;
  const barWidth = Math.min(34, slotWidth * 0.42);

  function getBarHeight(value: number): number {
    if (value <= 0) return 0;

    return Math.max((value / maxValue) * usableHeight, 8);
  }

  return (
    <ThemedSectionCard className="p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
          Medlemsudvikling i år
        </h2>
        <p className="mt-2 text-sm font-normal leading-relaxed text-[var(--public-text-muted)] sm:text-base">
          Tilgang vises ud fra oprettelses-/indmeldelsesdato. Afgang vises ud fra seneste opdateringsdato for udmeldt status, indtil historisk udmeldelsesdato importeres.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 text-sm font-semibold">
        <div className="flex items-center gap-2 text-[var(--public-text)]">
          <span className="h-3 w-3 rounded-full bg-[var(--public-primary)]" />
          Tilgang
        </div>
        <div className="flex items-center gap-2 text-[var(--public-text-muted)]">
          <span className="h-3 w-3 rounded-full border border-[var(--public-card-border)] bg-[var(--public-surface)]" />
          Afgang
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[760px]"
          role="img"
          aria-label="Medlemsudvikling i år"
        >
          <line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - paddingRight}
            y2={height - paddingBottom}
            stroke="var(--public-card-border)"
            strokeWidth="2"
          />

          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={height - paddingBottom}
            stroke="var(--public-card-border)"
            strokeWidth="2"
          />

          {[0, 1].map((ratio) => {
            const y = paddingTop + usableHeight * ratio;
            const value = Math.round(maxValue * (1 - ratio));

            return (
              <g key={ratio}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="var(--public-card-border)"
                  strokeWidth="1"
                  opacity="0.55"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-[var(--public-text-muted)] text-[11px]"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {points.map((point, index) => {
            const x = paddingLeft + index * slotWidth + slotWidth / 2;
            const joinedHeight = getBarHeight(point.joined);
            const leftHeight = getBarHeight(point.left);
            const joinedY = height - paddingBottom - joinedHeight;
            const leftY = height - paddingBottom - leftHeight;
            const groupedBarWidth = Math.min(22, barWidth * 0.72);

            return (
              <g key={point.label}>
                {point.joined > 0 ? (
                  <>
                    <rect
                      x={x - groupedBarWidth - 2}
                      y={joinedY}
                      width={groupedBarWidth}
                      height={joinedHeight}
                      rx="7"
                      fill="var(--public-primary)"
                    />
                    <text
                      x={x - groupedBarWidth / 2 - 2}
                      y={joinedY - 8}
                      textAnchor="middle"
                      className="fill-[var(--public-text)] text-[12px] font-bold"
                    >
                      {point.joined}
                    </text>
                  </>
                ) : null}

                {point.left > 0 ? (
                  <>
                    <rect
                      x={x + 2}
                      y={leftY}
                      width={groupedBarWidth}
                      height={leftHeight}
                      rx="7"
                      fill="var(--public-text-muted)"
                      opacity="0.75"
                    />
                    <text
                      x={x + groupedBarWidth / 2 + 2}
                      y={leftY - 8}
                      textAnchor="middle"
                      className="fill-[var(--public-text)] text-[12px] font-bold"
                    >
                      {point.left}
                    </text>
                  </>
                ) : null}

                {point.joined === 0 && point.left === 0 ? (
                  <text
                    x={x}
                    y={height - paddingBottom - 8}
                    textAnchor="middle"
                    className="fill-[var(--public-text-muted)] text-[11px]"
                  >
                    0
                  </text>
                ) : null}

                <text
                  x={x}
                  y={height - 12}
                  textAnchor="middle"
                  className="fill-[var(--public-text-muted)] text-[11px]"
                >
                  {point.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </ThemedSectionCard>
  );
}


export default async function StatisticsPage({ params }: StatisticsPageProps) {
  const { clubSlug } = await params;
  const pageSlug = "statistik";

  const {
    club,
    theme,
    footerData,
    navigationItems,
    actionItems,
    publicSettings,
  } = await resolvePublicPageForClub(clubSlug, pageSlug);

  const statistics = await getClubStatistics(club.id);

  return (
    <ThemedClubPageShell
      clubSlug={clubSlug}
      clubName={club.settings?.shortName || club.name}
      clubDisplayName={publicSettings?.displayName || club.settings?.displayName || club.name}
      theme={theme}
      publicThemeMode={publicSettings?.publicThemeMode}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title="Statistik"
      subtitle="Overblik over medlemmer, medlemsudvikling og aktivitet i klubben."
      currentPath={publicRoutes.statistics(clubSlug)}
      maxWidth="1120px"
    >
      <div className="mt-6 space-y-8">
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
              Medlemsstatus
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <KpiCard label="Aktive medlemmer" value={statistics.memberStatus.totalActive} />
            <KpiCard label="Senior" value={statistics.memberStatus.senior} />
            <KpiCard label="Junior" value={statistics.memberStatus.junior} />
            <KpiCard label="Passiv" value={statistics.memberStatus.passive} />
            <KpiCard label="Elever" value={statistics.memberStatus.students} />
            <KpiCard label="Instruktører" value={statistics.memberStatus.instructors} />
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
              Medlemsudvikling
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <KpiCard
              label="Nye medlemmer i år"
              value={statistics.membershipDevelopment.newThisYear}
              helper="Baseret på oprettelses-/indmeldelsesdato."
            />
            <KpiCard
              label="Udmeldte i databasen"
              value={statistics.membershipDevelopment.leftTotal}
              helper="Baseret på medlemsstatus. Dato bruger seneste opdatering indtil importhistorik findes."
            />
            <KpiCard
              label="Netto i år"
              value={statistics.membershipDevelopment.netThisYear ?? "Afventer historik"}
              helper="Tilgang minus udmeldte i år."
            />
          </div>
        </section>

        <MembershipDevelopmentChart points={statistics.membershipDevelopment.monthly} />

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
              Klubaktivitet
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <KpiCard label="Flyvemeldinger i dag" value={statistics.activity.flightIntentsToday} />
            <KpiCard label="Unikke logins i dag" value={statistics.activity.uniqueLoginsToday} />
            <KpiCard label="Flyvemeldinger seneste 30 dage" value={statistics.activity.flightIntentsLast30Days} />
            <KpiCard label="Unikke logins seneste 30 dage" value={statistics.activity.uniqueLoginsLast30Days} />
            <KpiCard label="Flyvemeldinger i år" value={statistics.activity.flightIntentsThisYear} />
          </div>
        </section>

        <ActivityLineChart points={statistics.activity.dailyActivity} />
      </div>
    </ThemedClubPageShell>
  );
}
