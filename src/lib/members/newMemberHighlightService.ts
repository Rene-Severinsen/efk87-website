import prisma from "../db/prisma";
import { getMemberDisplayName } from "./memberUtils";
import { ClubMemberStatus } from "../../generated/prisma";

export const NEW_MEMBER_HIGHLIGHT_DAYS = 14;

export interface NewMemberHighlight {
  id: string;
  displayName: string;
  joinedAt: Date;
  profileImageUrl: string | null;
}

export interface NewMemberHighlightData {
  visible: boolean;
  latestDate: Date | null;
  members: NewMemberHighlight[];
}

export async function getNewMemberHighlights(clubId: string): Promise<NewMemberHighlightData> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - NEW_MEMBER_HIGHLIGHT_DAYS);

  const members = await prisma.clubMemberProfile.findMany({
    where: {
      clubId,
      joinedAt: {
        gte: cutoffDate,
      },
      memberStatus: {
        not: ClubMemberStatus.RESIGNED,
      },
    },
    include: {
      user: true,
    },
    orderBy: {
      joinedAt: 'desc',
    },
    take: 5,
  });

  const formattedMembers = members
    .filter((m) => m.joinedAt !== null)
    .map((m) => ({
      id: m.id,
      displayName: getMemberDisplayName(m, m.user),
      joinedAt: m.joinedAt!,
      profileImageUrl: m.profileImageUrl,
    }));

  return {
    visible: formattedMembers.length > 0,
    latestDate: formattedMembers.length > 0 ? formattedMembers[0].joinedAt : null,
    members: formattedMembers,
  };
}
