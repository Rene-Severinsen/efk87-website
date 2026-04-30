import { Prisma } from "@/generated/prisma";
import prisma from "../db/prisma";
import { getMemberDisplayName } from "../members/memberUtils";

export interface AdminMemberOverviewDTO {
  userId: string;
  displayName: string | null;
  email: string;
  firstName: string | null;
  lastName: string | null;
  mobilePhone: string | null;
  memberNumber: number | null;
  mdkNumber: string | null;
  membershipType: string;
  memberRoleType: string;
  schoolStatus: string;
  memberStatus: string;
  isInstructor: boolean;
  certificateCount: number;
  updatedAt: Date;
}

export interface AdminMemberStatsDTO {
  total: number;
  active: number;
  resigned: number;
  new: number;
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

  const where: Prisma.ClubMemberProfileWhereInput = { clubId };

  if (filter) {
    switch (filter) {
      case "active":
        where.memberStatus = "ACTIVE";
        break;
      case "under_creation":
        where.memberStatus = "NEW";
        break;
      case "resigned":
        where.memberStatus = "RESIGNED";
        break;
      case "senior":
        where.membershipType = "SENIOR";
        break;
      case "junior":
        where.membershipType = "JUNIOR";
        break;
      case "passive":
        where.membershipType = "PASSIVE";
        break;
      case "approved":
        where.schoolStatus = "APPROVED";
        break;
      case "student":
        where.schoolStatus = "STUDENT";
        break;
      case "not_approved":
        where.schoolStatus = "NOT_APPROVED";
        break;
      case "instructor":
        where.isInstructor = true;
        break;
    }
  }

  // Define order by
  let orderBy: Prisma.ClubMemberProfileOrderByWithRelationInput[] = [];

  switch (sort) {
    case "name":
      orderBy = [{ firstName: direction }, { lastName: direction }];
      break;
    case "memberNumber":
      orderBy = [{ memberNumber: direction }];
      break;
    case "mdkNumber":
      orderBy = [{ mdkNumber: direction }];
      break;
    case "membershipType":
      orderBy = [{ membershipType: direction }];
      break;
    case "memberRoleType":
      orderBy = [{ memberRoleType: direction }];
      break;
    case "schoolStatus":
      orderBy = [{ schoolStatus: direction }];
      break;
    case "memberStatus":
      orderBy = [{ memberStatus: direction }];
      break;
    case "instructorStatus":
      orderBy = [{ isInstructor: direction }];
      break;
    default:
      // Default sort: member full name ascending A-Z
      orderBy = [{ firstName: "asc" }, { lastName: "asc" }];
  }

  // Always add stable fallback order
  orderBy.push({ firstName: "asc" });
  orderBy.push({ memberNumber: "asc" });
  orderBy.push({ id: "asc" });

  const members = await prisma.clubMemberProfile.findMany({
    where,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy,
  });

  // Prisma doesn't support direct counting of related certificates easily in this structure without more complex query
  // Let's get counts separately or refine the query
  const certificateCounts = await prisma.clubMemberCertificate.groupBy({
    by: ["userId"],
    where: { clubId },
    _count: {
      id: true,
    },
  });

  const countMap = new Map(certificateCounts.map((c) => [c.userId, c._count.id]));

  const result = members.map((m) => ({
    userId: m.userId,
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

  if (sort === "certificateCount") {
    result.sort((a, b) => {
      const diff = a.certificateCount - b.certificateCount;
      return direction === "asc" ? diff : -diff;
    });
  }

  return result;
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
  const stats = await prisma.clubMemberProfile.groupBy({
    by: ["memberStatus", "membershipType", "schoolStatus", "isInstructor"],
    where: { clubId },
    _count: {
      id: true,
    },
  });

  const result: AdminMemberStatsDTO = {
    total: 0,
    active: 0,
    resigned: 0,
    new: 0,
    senior: 0,
    junior: 0,
    passive: 0,
    approved: 0,
    student: 0,
    notApproved: 0,
    instructors: 0,
  };

  for (const s of stats) {
    const count = s._count.id;
    
    // "Under oprettelse" (NEW) members are counted separately and NOT included in other counts or total
    if (s.memberStatus === "NEW") {
      result.new += count;
      continue;
    }

    result.total += count;

    if (s.memberStatus === "ACTIVE") result.active += count;
    if (s.memberStatus === "RESIGNED") result.resigned += count;

    if (s.membershipType === "SENIOR") result.senior += count;
    if (s.membershipType === "JUNIOR") result.junior += count;
    if (s.membershipType === "PASSIVE") result.passive += count;

    if (s.schoolStatus === "APPROVED") result.approved += count;
    if (s.schoolStatus === "STUDENT") result.student += count;
    if (s.schoolStatus === "NOT_APPROVED") result.notApproved += count;

    if (s.isInstructor) result.instructors += count;
  }

  return result;
}
