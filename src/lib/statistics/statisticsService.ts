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
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
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
      updatedAt: true,
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

  leftMembers.forEach((member) => {
    if (member.updatedAt.getFullYear() !== now.getFullYear()) return;

    const point = monthlyByKey.get(monthKey(member.updatedAt));
    if (!point) return;

    point.left += 1;
    point.net -= 1;
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
      netThisYear: newThisYear - leftMembers.filter((member) => member.updatedAt >= yearStart).length,
      hasLeftDateHistory: true,
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
