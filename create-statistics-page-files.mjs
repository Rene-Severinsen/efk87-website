import fs from "fs";
import path from "path";

const root = process.cwd();

function ensureDir(filePath) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeFile(relativePath, content) {
    const absolutePath = path.join(root, relativePath);
    ensureDir(absolutePath);
    fs.writeFileSync(absolutePath, content.trimStart(), "utf8");
    console.log(`Wrote ${relativePath}`);
}

function patchFile(relativePath, patcher) {
    const absolutePath = path.join(root, relativePath);

    if (!fs.existsSync(absolutePath)) {
        console.warn(`Skipped ${relativePath} — file not found`);
        return;
    }

    const current = fs.readFileSync(absolutePath, "utf8");
    const next = patcher(current);

    if (next === current) {
        console.log(`No change ${relativePath}`);
        return;
    }

    fs.writeFileSync(absolutePath, next, "utf8");
    console.log(`Patched ${relativePath}`);
}

writeFile(
    "src/lib/statistics/statisticsService.ts",
    `
import prisma from "../db/prisma";

type MemberStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "LEFT" | string;
type MembershipType = "SENIOR" | "JUNIOR" | "PASSIVE" | string;

export interface StatisticsKpi {
  label: string;
  value: number;
  helper?: string;
}

export interface DailyActivityPoint {
  date: string;
  label: string;
  count: number;
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
    dailyFlightIntents: DailyActivityPoint[];
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

  return normalized === "LEFT" || normalized === "UDMELDT" || normalized === "INACTIVE";
}

function isStudentStatus(status: unknown): boolean {
  const normalized = String(status || "").toUpperCase();

  return normalized.includes("STUDENT") || normalized.includes("ELEV");
}

export async function getClubStatistics(clubId: string): Promise<ClubStatistics> {
  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
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

  const dailyBase = Array.from({ length: 30 }, (_value, index) => {
    const date = addDays(thirtyDaysAgo, index);

    return {
      date: dateKey(date),
      label: dateLabel(date),
      count: 0,
    };
  });

  const dailyByKey = new Map(dailyBase.map((point) => [point.date, point]));

  const flightIntents = await prisma.flightIntent.findMany({
    where: {
      clubId,
      flyingDate: {
        gte: thirtyDaysAgo,
      },
    },
    select: {
      flyingDate: true,
      createdAt: true,
    },
  });

  flightIntents.forEach((intent) => {
    const key = dateKey(intent.flyingDate);
    const point = dailyByKey.get(key);

    if (point) {
      point.count += 1;
    }
  });

  const flightIntentsToday = flightIntents.filter(
    (intent) => intent.flyingDate >= today && intent.flyingDate < tomorrow,
  ).length;

  const flightIntentsLast30Days = flightIntents.length;

  const flightIntentsThisYear = await prisma.flightIntent.count({
    where: {
      clubId,
      flyingDate: {
        gte: yearStart,
      },
    },
  });

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
      flightIntentsLast30Days,
      flightIntentsThisYear,
      dailyFlightIntents: dailyBase,
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

function BarChart({
  title,
  description,
  points,
  valueLabel,
}: {
  title: string;
  description: string;
  points: { label: string; count: number }[];
  valueLabel: string;
}) {
  const maxValue = Math.max(...points.map((point) => point.count), 1);

  return (
    <ThemedSectionCard className="p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
          {title}
        </h2>
        <p className="mt-2 text-sm font-normal leading-relaxed text-[var(--public-text-muted)] sm:text-base">
          {description}
        </p>
      </div>

      <div className="flex h-64 items-end gap-2 overflow-x-auto rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-4">
        {points.map((point) => {
          const height = Math.max((point.count / maxValue) * 100, point.count > 0 ? 8 : 2);

          return (
            <div key={point.label} className="flex min-w-8 flex-1 flex-col items-center justify-end gap-2">
              <div className="text-xs font-semibold text-[var(--public-text-muted)]">
                {point.count}
              </div>
              <div
                className="w-full rounded-t-lg bg-[var(--public-primary)]"
                style={{ height: \`\${height}%\` }}
                title={\`\${point.label}: \${point.count} \${valueLabel}\`}
              />
              <div className="whitespace-nowrap text-[0.68rem] font-medium text-[var(--public-text-muted)]">
                {point.label}
              </div>
            </div>
          );
        })}
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
            <KpiCard label="Flyvemeldinger seneste 30 dage" value={statistics.activity.flightIntentsLast30Days} />
            <KpiCard label="Flyvemeldinger i år" value={statistics.activity.flightIntentsThisYear} />
          </div>
        </section>

        <BarChart
          title="Flyvemeldinger seneste 30 dage"
          description="Antal registrerede “Jeg flyver”-meldinger pr. dag."
          points={statistics.activity.dailyFlightIntents}
          valueLabel="flyvemeldinger"
        />
      </div>
    </ThemedClubPageShell>
  );
}
`,
);

patchFile("src/lib/publicRoutes.ts", (current) => {
    if (current.includes("statistics:")) return current;

    return current.replace(
        /finance:\s*\(clubSlug:\s*string\)\s*=>\s*`\/\$\{clubSlug\}\/om\/oekonomi`,/,
        `finance: (clubSlug: string) => \`/\${clubSlug}/om/oekonomi\`,
  statistics: (clubSlug: string) => \`/\${clubSlug}/om/statistik\`,`,
    );
});

patchFile("src/app/[clubSlug]/about/page.tsx", (current) => {
    if (current.includes("href: publicRoutes.statistics(clubSlug)")) return current;

    return current.replace(
        /{\s*title:\s*"Statistik",\s*description:\s*"Historik, udvikling og nøgletal om klubben\.",\s*icon:\s*"📊",\s*available:\s*false,\s*}/,
        `{
      title: "Statistik",
      description: "Medlemmer, medlemsudvikling og aktivitet i klubben.",
      icon: "📊",
      href: publicRoutes.statistics(clubSlug),
      available: true,
    }`,
    );
});

console.log("");
console.log("Done.");
console.log("Next:");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");