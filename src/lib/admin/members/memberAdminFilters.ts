import { Prisma, ClubMemberStatus, ClubMemberMembershipType, ClubMemberSchoolStatus } from "@/generated/prisma";

/**
 * Shared member admin filter/stat helper logic.
 * Consolidates business logic for what defines a Senior, Junior, Passive, etc.
 * 
 * Business Rules:
 * - "Countable" members are only those with status ACTIVE.
 * - Under-creation (NEW) members are excluded from all normal KPI counts.
 * - Resigned (RESIGNED) members are excluded from all normal KPI counts.
 * - Each KPI tile (Junior, Passiv, etc.) must use the exact same logic for counting and table filtering.
 */

export type MemberAdminFilterKey = 
  | "active" 
  | "creation" 
  | "resigned" 
  | "senior" 
  | "junior" 
  | "passive" 
  | "approved" 
  | "student" 
  | "notApproved" 
  | "instructor";

export interface MemberAdminFilter {
  key: MemberAdminFilterKey;
  label: string;
  colorClass?: string;
  // Predicate for in-memory filtering/counting
  isMatch: (member: PartialMember) => boolean;
  // Prisma where clause for server-side filtering/counting
  where: Prisma.ClubMemberProfileWhereInput;
}

export interface PartialMember {
  memberStatus: ClubMemberStatus;
  membershipType: ClubMemberMembershipType;
  schoolStatus: ClubMemberSchoolStatus;
  isInstructor: boolean;
  firstName?: string | null;
  lastName?: string | null;
  [key: string]: unknown; // Allow other properties
}

// 1. Shared predicates
export const isUnderCreationMember = (member: { memberStatus: ClubMemberStatus | string }) => 
  member.memberStatus === ClubMemberStatus.NEW;

export const isResignedMember = (member: { memberStatus: ClubMemberStatus | string }) => 
  member.memberStatus === ClubMemberStatus.RESIGNED;

export const isActiveMember = (member: { memberStatus: ClubMemberStatus | string }) => 
  member.memberStatus === ClubMemberStatus.ACTIVE;

/**
 * Normal KPI counts should include only members that are not under creation and not resigned/inactive.
 */
export const isCountableMember = (member: PartialMember) => 
  isActiveMember(member);

// 2. Filter definitions
export const MEMBER_ADMIN_FILTERS: Record<MemberAdminFilterKey, MemberAdminFilter> = {
  active: {
    key: "active",
    label: "Aktive",
    colorClass: "text-emerald-400",
    isMatch: (m) => isCountableMember(m),
    where: { memberStatus: ClubMemberStatus.ACTIVE },
  },
  creation: {
    key: "creation",
    label: "Oprettelse",
    colorClass: "text-sky-400",
    isMatch: (m) => isUnderCreationMember(m),
    where: { memberStatus: ClubMemberStatus.NEW },
  },
  resigned: {
    key: "resigned",
    label: "Udmeldte",
    colorClass: "text-rose-400",
    isMatch: (m) => isResignedMember(m),
    where: { memberStatus: ClubMemberStatus.RESIGNED },
  },
  senior: {
    key: "senior",
    label: "Senior",
    isMatch: (m) => isCountableMember(m) && m.membershipType === ClubMemberMembershipType.SENIOR,
    where: { 
      memberStatus: ClubMemberStatus.ACTIVE,
      membershipType: ClubMemberMembershipType.SENIOR 
    },
  },
  junior: {
    key: "junior",
    label: "Junior",
    isMatch: (m) => isCountableMember(m) && m.membershipType === ClubMemberMembershipType.JUNIOR,
    where: { 
      memberStatus: ClubMemberStatus.ACTIVE,
      membershipType: ClubMemberMembershipType.JUNIOR 
    },
  },
  passive: {
    key: "passive",
    label: "Passive",
    isMatch: (m) => isCountableMember(m) && m.membershipType === ClubMemberMembershipType.PASSIVE,
    where: { 
      memberStatus: ClubMemberStatus.ACTIVE,
      membershipType: ClubMemberMembershipType.PASSIVE 
    },
  },
  approved: {
    key: "approved",
    label: "Godkendte",
    colorClass: "text-emerald-400",
    isMatch: (m) => isCountableMember(m) && m.schoolStatus === ClubMemberSchoolStatus.APPROVED,
    where: { 
      memberStatus: ClubMemberStatus.ACTIVE,
      schoolStatus: ClubMemberSchoolStatus.APPROVED 
    },
  },
  student: {
    key: "student",
    label: "Elever",
    colorClass: "text-amber-400",
    isMatch: (m) => isCountableMember(m) && m.schoolStatus === ClubMemberSchoolStatus.STUDENT,
    where: { 
      memberStatus: ClubMemberStatus.ACTIVE,
      schoolStatus: ClubMemberSchoolStatus.STUDENT 
    },
  },
  notApproved: {
    key: "notApproved",
    label: "Ikke godkendt",
    colorClass: "text-rose-400",
    isMatch: (m) => isCountableMember(m) && m.schoolStatus === ClubMemberSchoolStatus.NOT_APPROVED,
    where: { 
      memberStatus: ClubMemberStatus.ACTIVE,
      schoolStatus: ClubMemberSchoolStatus.NOT_APPROVED 
    },
  },
  instructor: {
    key: "instructor",
    label: "Instruktør",
    colorClass: "text-violet-400",
    isMatch: (m) => isCountableMember(m) && m.isInstructor === true,
    where: { 
      memberStatus: ClubMemberStatus.ACTIVE,
      isInstructor: true 
    },
  },
};

// 3. Helper functions

/**
 * Calculate all admin stats from a full member list in-memory.
 */
export function getMemberAdminStats(members: PartialMember[]) {
  return {
    total: members.filter(m => !isUnderCreationMember(m)).length,
    active: members.filter(m => MEMBER_ADMIN_FILTERS.active.isMatch(m)).length,
    resigned: members.filter(m => MEMBER_ADMIN_FILTERS.resigned.isMatch(m)).length,
    creation: members.filter(m => MEMBER_ADMIN_FILTERS.creation.isMatch(m)).length,
    senior: members.filter(m => MEMBER_ADMIN_FILTERS.senior.isMatch(m)).length,
    junior: members.filter(m => MEMBER_ADMIN_FILTERS.junior.isMatch(m)).length,
    passive: members.filter(m => MEMBER_ADMIN_FILTERS.passive.isMatch(m)).length,
    approved: members.filter(m => MEMBER_ADMIN_FILTERS.approved.isMatch(m)).length,
    student: members.filter(m => MEMBER_ADMIN_FILTERS.student.isMatch(m)).length,
    notApproved: members.filter(m => MEMBER_ADMIN_FILTERS.notApproved.isMatch(m)).length,
    instructors: members.filter(m => MEMBER_ADMIN_FILTERS.instructor.isMatch(m)).length,
  };
}

/**
 * Filter a list of members in-memory based on a filter key.
 */
export function filterMembersForAdmin(members: PartialMember[], filterKey: MemberAdminFilterKey | string | null | undefined) {
  if (!filterKey || !(filterKey in MEMBER_ADMIN_FILTERS)) {
    return members;
  }
  
  const filterDef = MEMBER_ADMIN_FILTERS[filterKey as MemberAdminFilterKey];
  return members.filter(m => filterDef.isMatch(m));
}

/**
 * Sort a list of members in-memory.
 */
export function sortMembersForAdmin<T extends PartialMember>(members: T[], sortKey: string, direction: "asc" | "desc") {
  const sorted = [...members];
  
  sorted.sort((a, b) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let valA = a[sortKey as keyof T] as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let valB = b[sortKey as keyof T] as any;
    
    // Handle special cases
    if (sortKey === "name") {
      valA = (a.firstName || "") + (a.lastName || "");
      valB = (b.firstName || "") + (b.lastName || "");
    } else if (sortKey === "instructorStatus") {
      valA = a.isInstructor ? 1 : 0;
      valB = b.isInstructor ? 1 : 0;
    }
    
    if (valA < valB) return direction === "asc" ? -1 : 1;
    if (valA > valB) return direction === "asc" ? 1 : -1;
    return 0;
  });
  
  return sorted;
}
