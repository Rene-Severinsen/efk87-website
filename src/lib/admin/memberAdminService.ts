import prisma from "../db/prisma";
import { getMemberDisplayName } from "../members/memberUtils";
import { 
  ClubMemberStatus, 
  ClubMemberMembershipType, 
  ClubMemberSchoolStatus, 
  ClubMemberRoleType 
} from "@/generated/prisma";
import { 
  getMemberAdminStats, 
  filterMembersForAdmin, 
  sortMembersForAdmin 
} from "./members/memberAdminFilters";

/**
 * Normalized read model for the member administration list.
 * This DTO allows the UI to display both active members (ClubMemberProfile)
 * and pending applications (PublicMemberApplication) safely in the same table.
 */
export interface AdminMemberOverviewDTO {
  id: string; // Internal unique ID (userId or applicationId)
  userId: string | null;
  applicationId: string | null;
  displayName: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  mobilePhone: string | null;
  memberNumber: number | null;
  mdkNumber: string | null;
  membershipType: ClubMemberMembershipType;
  memberRoleType: ClubMemberRoleType | null;
  schoolStatus: ClubMemberSchoolStatus;
  memberStatus: ClubMemberStatus;
  isInstructor: boolean;
  certificateCount: number;
  updatedAt: Date;
}

export interface AdminMemberStatsDTO {
  total: number;
  active: number;
  resigned: number;
  creation: number;
  senior: number;
  junior: number;
  passive: number;
  approved: number;
  student: number;
  notApproved: number;
  instructors: number;
}

export async function getAdminMemberOverview(
  clubId: string,
  options: {
    sort?: string;
    direction?: "asc" | "desc";
    filter?: string;
  } = {}
): Promise<AdminMemberOverviewDTO[]> {
  const { sort = "name", direction = "asc", filter } = options;

  const members = await getAdminMemberRows(clubId);
  
  const filtered = filterMembersForAdmin(members, filter);
  const sorted = sortMembersForAdmin(filtered, sort, direction);

  return sorted;
}

export async function getAdminMemberRows(clubId: string): Promise<AdminMemberOverviewDTO[]> {
  const profiles = await prisma.clubMemberProfile.findMany({
    where: { clubId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const applications = await prisma.publicMemberApplication.findMany({
    where: { clubId },
  });

  const certificateCounts = await prisma.clubMemberCertificate.groupBy({
    by: ["userId"],
    where: { clubId },
    _count: {
      id: true,
    },
  });

  const countMap = new Map(certificateCounts.map((c) => [c.userId, c._count.id]));

  const profileDTOs: AdminMemberOverviewDTO[] = profiles.map((m) => ({
    id: m.userId,
    userId: m.userId,
    applicationId: null,
    displayName: getMemberDisplayName(m, m.user),
    email: m.user.email,
    firstName: m.firstName,
    lastName: m.lastName,
    mobilePhone: m.mobilePhone,
    memberNumber: m.memberNumber,
    mdkNumber: m.mdkNumber,
    membershipType: m.membershipType,
    memberRoleType: m.memberRoleType,
    schoolStatus: m.schoolStatus,
    memberStatus: m.memberStatus,
    isInstructor: m.isInstructor,
    certificateCount: countMap.get(m.userId) || 0,
    updatedAt: m.updatedAt,
  }));

  const applicationDTOs: AdminMemberOverviewDTO[] = applications.map((a) => ({
    id: a.id,
    userId: null,
    applicationId: a.id,
    displayName: `${a.firstName} ${a.lastName}`,
    email: null,
    firstName: a.firstName,
    lastName: a.lastName,
    mobilePhone: a.mobilePhone,
    memberNumber: a.memberNumber,
    mdkNumber: a.mdkNumber,
    membershipType: a.membershipType,
    memberRoleType: null,
    schoolStatus: a.schoolStatus,
    memberStatus: a.status,
    isInstructor: false,
    certificateCount: 0,
    updatedAt: a.updatedAt,
  }));

  return [...profileDTOs, ...applicationDTOs];
}

export async function getAdminMemberByUserId(clubId: string, userId: string) {
  const profile = await prisma.clubMemberProfile.findUnique({
    where: {
      clubId_userId: {
        clubId,
        userId,
      },
    },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  if (!profile) return null;

  const certificates = await prisma.clubMemberCertificate.findMany({
    where: {
      clubId,
      userId,
    },
    select: {
      certificateType: true,
    },
  });

  return {
    ...profile,
    email: profile.user.email,
    displayName: getMemberDisplayName(profile, profile.user),
    certificates: certificates.map((c) => c.certificateType),
  };
}

export async function getAdminMemberStats(clubId: string): Promise<AdminMemberStatsDTO> {
  const members = await getAdminMemberRows(clubId);
  return getMemberAdminStats(members);
}
