import fs from "fs";
import path from "path";

const root = process.cwd();

function writeFile(relativePath, content) {
    const absolutePath = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content.trimStart(), "utf8");
    console.log(`Wrote ${relativePath}`);
}

writeFile(
    "src/lib/statistics/statisticsService.ts",
    `
import prisma from "../db/prisma";

type MemberStatus = "ACTIVE" | "RESIGNED" | "NEW" | string;
type MembershipType = "SENIOR" | "JUNIOR" | "PASSIVE" | string;

export interface DailyActivityPoint {
  date: string;
  label: string;
  flightIntents: number;
  uniqueLogins: number;
}

export interface MembershipDevelopmentPoint {
  month: string;
  label: string;
  joined: number;
  left: number;
  net: number;
}

export interface ClubStatistics {
  memberStatus: {
    totalActive: number;
    senior: number;
    junior: number;
    passive: number;
    students: number;
    instructors: number;
    leftTotal: number;
  };
  membershipDevelopment: {
    newThisYear: number;
    leftTotal: number;
    netThisYear: number | null;
    hasLeftDateHistory: boolean;
    monthly: MembershipDevelopmentPoint[];
  };
  activity: {
    flightIntentsToday: number;
    flightIntentsLast30Days: number;
    flightIntentsThisYear: number;
    uniqueLoginsToday: number;
    uniqueLoginsLast30Days: number;
    dailyActivity: DailyActivityPoint[];
  };
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

function monthKey(date: Date): string {
  return \`\${date.getFullYear()}-\${String(date.getMonth() + 1).padStart(2, "0")}\`;
}

function monthLabel(date: Date): string {
  return new Intl.DateTimeFormat("da-DK", {
    month: "short",
  }).format(date);
}

function dateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function dateLabel(date: Date): string {
  return new Intl.DateTimeFormat("da-DK", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function normalizeMemberStatus(status: unknown): MemberStatus {
  return String(status || "").toUpperCase();
}

function normalizeMembershipType(type: unknown): MembershipType {
  return String(type || "").toUpperCase();
}

function isActiveStatus(status: unknown): boolean {
  return normalizeMemberStatus(status) === "ACTIVE";
}

function isLeftStatus(status: unknown): boolean {
  const normalized = normalizeMemberStatus(status);

  return normalized === "RESIGNED" || normalized === "LEFT" || normalized === "UDMELDT" || normalized === "INACTIVE";
}

function isStudentStatus(status: unknown): boolean {
  const normalized = String(status || "").toUpperCase();

  return normalized.includes("STUDENT") || normalized.includes("ELEV");
}

export async function getClubStatistics(clubId: string): Promise<ClubStatistics> {
  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const fourteenDaysAgo = addDays(today, -13);
  const thirtyDaysAgo = addDays(today, -29);
  const yearStart = startOfYear(now);

  const members = await prisma.clubMemberProfile.findMany({
    where: {
      clubId,
    },
    select: {
      id: true,
      createdAt: true,
      memberStatus: true,
      membershipType: true,
      schoolStatus: true,
      isInstructor: true,
    },
  });

  const activeMembers = members.filter((member) => isActiveStatus(member.memberStatus));
  const leftMembers = members.filter((member) => isLeftStatus(member.memberStatus));

  const senior = activeMembers.filter(
    (member) => normalizeMembershipType(member.membershipType) === "SENIOR",
  ).length;

  const junior = activeMembers.filter(
    (member) => normalizeMembershipType(member.membershipType) === "JUNIOR",
  ).length;

  const passive = activeMembers.filter(
    (member) => normalizeMembershipType(member.membershipType) === "PASSIVE",
  ).length;

  const students = activeMembers.filter((member) => isStudentStatus(member.schoolStatus)).length;
  const instructors = activeMembers.filter((member) => member.isInstructor).length;

  const newThisYear = members.filter((member) => member.createdAt >= yearStart).length;

  const monthlyBase = Array.from({ length: 12 }, (_value, index) => {
    const monthDate = new Date(now.getFullYear(), index, 1);

    return {
      month: monthKey(monthDate),
      label: monthLabel(monthDate),
      joined: 0,
      left: 0,
      net: 0,
    };
  });

  const monthlyByKey = new Map(monthlyBase.map((point) => [point.month, point]));

  members.forEach((member) => {
    if (member.createdAt.getFullYear() !== now.getFullYear()) return;

    const point = monthlyByKey.get(monthKey(member.createdAt));
    if (!point) return;

    point.joined += 1;
    point.net += 1;
  });

  const dailyBase = Array.from({ length: 14 }, (_value, index) => {
    const date = addDays(fourteenDaysAgo, index);

    return {
      date: dateKey(date),
      label: dateLabel(date),
      flightIntents: 0,
      uniqueLogins: 0,
    };
  });

  const dailyByKey = new Map(dailyBase.map((point) => [point.date, point]));

  const flightIntentsLast30DaysRows = await prisma.clubFlightIntent.findMany({
    where: {
      clubId,
      status: "ACTIVE",
      flightDate: {
        gte: thirtyDaysAgo,
      },
    },
    select: {
      flightDate: true,
    },
  });

  const flightIntentsForChart = flightIntentsLast30DaysRows.filter(
    (intent) => intent.flightDate >= fourteenDaysAgo,
  );

  flightIntentsForChart.forEach((intent) => {
    const key = dateKey(intent.flightDate);
    const point = dailyByKey.get(key);

    if (point) {
      point.flightIntents += 1;
    }
  });

  const flightIntentsToday = flightIntentsLast30DaysRows.filter(
    (intent) => intent.flightDate >= today && intent.flightDate < tomorrow,
  ).length;

  const flightIntentsThisYear = await prisma.clubFlightIntent.count({
    where: {
      clubId,
      status: "ACTIVE",
      flightDate: {
        gte: yearStart,
      },
    },
  });

  const dailyActivityLast30DaysRows = await prisma.memberDailyActivity.findMany({
    where: {
      clubId,
      activityDate: {
        gte: thirtyDaysAgo,
      },
    },
    select: {
      activityDate: true,
      userId: true,
    },
  });

  const dailyActivityForChart = dailyActivityLast30DaysRows.filter(
    (activity) => activity.activityDate >= fourteenDaysAgo,
  );

  dailyActivityForChart.forEach((activity) => {
    const key = dateKey(activity.activityDate);
    const point = dailyByKey.get(key);

    if (point) {
      point.uniqueLogins += 1;
    }
  });

  const uniqueLoginsToday = dailyActivityLast30DaysRows.filter(
    (activity) => activity.activityDate >= today && activity.activityDate < tomorrow,
  ).length;

  return {
    memberStatus: {
      totalActive: activeMembers.length,
      senior,
      junior,
      passive,
      students,
      instructors,
      leftTotal: leftMembers.length,
    },
    membershipDevelopment: {
      newThisYear,
      leftTotal: leftMembers.length,
      netThisYear: null,
      hasLeftDateHistory: false,
      monthly: monthlyBase,
    },
    activity: {
      flightIntentsToday,
      flightIntentsLast30Days: flightIntentsLast30DaysRows.length,
      flightIntentsThisYear,
      uniqueLoginsToday,
      uniqueLoginsLast30Days: dailyActivityLast30DaysRows.length,
      dailyActivity: dailyBase,
    },
  };
}
`,
);

writeFile(
    "src/app/[clubSlug]/om/statistik/page.tsx",
    `
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

      return \`\${x},\${y}\`;
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
          viewBox={\`0 0 \${width} \${height}\`}
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
  const maxValue = Math.max(...points.map((point) => Math.max(point.joined, point.left)), 1);

  return (
    <ThemedSectionCard className="p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
          Medlemsudvikling i år
        </h2>
        <p className="mt-2 text-sm font-normal leading-relaxed text-[var(--public-text-muted)] sm:text-base">
          Tilgang vises ud fra oprettelses-/indmeldelsesdato. Afgang pr. måned kobles på, når historisk udmeldelsesdato er valideret ved import.
        </p>
      </div>

      <div className="flex h-64 items-end gap-3 overflow-x-auto rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-4">
        {points.map((point) => {
          const joinedHeight = Math.max((point.joined / maxValue) * 100, point.joined > 0 ? 8 : 2);

          return (
            <div key={point.label} className="flex min-w-12 flex-1 flex-col items-center justify-end gap-2">
              <div className="text-xs font-semibold text-[var(--public-text-muted)]">
                {point.joined}
              </div>
              <div className="flex h-full w-full items-end justify-center gap-1">
                <div
                  className="w-5 rounded-t-lg bg-[var(--public-primary)]"
                  style={{ height: \`\${joinedHeight}%\` }}
                  title={\`\${point.label}: \${point.joined} nye medlemmer\`}
                />
              </div>
              <div className="whitespace-nowrap text-[0.72rem] font-medium text-[var(--public-text-muted)]">
                {point.label}
              </div>
            </div>
          );
        })}
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
              helper="Baseret på medlemsstatus."
            />
            <KpiCard
              label="Netto i år"
              value="Afventer historik"
              helper="Kræver valideret udmeldelsesdato fra importen."
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
`,
);

console.log("");
console.log("Done.");
console.log("Next:");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");