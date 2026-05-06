import prisma from "../db/prisma";
import { ClubMemberStatus } from "../../generated/prisma";
import { getMemberDisplayName } from "./memberUtils";

export interface BirthdayHighlightMember {
  id: string;
  displayName: string;
}

export interface BirthdayHighlightData {
  visible: boolean;
  members: BirthdayHighlightMember[];
}

function getCopenhagenMonthDay(date: Date): { month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Copenhagen",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);

  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return { month, day };
}

export async function getTodayBirthdayHighlights(clubId: string): Promise<BirthdayHighlightData> {
  const today = getCopenhagenMonthDay(new Date());

  const profiles = await prisma.clubMemberProfile.findMany({
    where: {
      clubId,
      memberStatus: ClubMemberStatus.ACTIVE,
      birthDate: {
        not: null,
      },
    },
    include: {
      user: true,
    },
    orderBy: [
      { firstName: "asc" },
      { lastName: "asc" },
    ],
  });

  const members = profiles
    .filter((profile) => {
      if (!profile.birthDate) return false;

      const birthday = getCopenhagenMonthDay(profile.birthDate);
      return birthday.month === today.month && birthday.day === today.day;
    })
    .map((profile) => ({
      id: profile.id,
      displayName: getMemberDisplayName(profile, profile.user),
    }));

  return {
    visible: members.length > 0,
    members,
  };
}
