import { Prisma, ClubMemberStatus, ClubMemberMembershipType, ClubMemberSchoolStatus } from "@/generated/prisma";

export type MemberFilterKey = 
  | "active" 
  | "under_creation" 
  | "resigned" 
  | "senior" 
  | "junior" 
  | "passive" 
  | "approved" 
  | "student" 
  | "not_approved" 
  | "instructor";

export interface FilterDefinition {
  key: MemberFilterKey;
  label: string;
  colorClass?: string;
  where: Prisma.ClubMemberProfileWhereInput;
}

export const MEMBER_FILTER_DEFINITIONS: Record<MemberFilterKey, FilterDefinition> = {
  active: {
    key: "active",
    label: "Aktive",
    colorClass: "text-emerald-400",
    where: { memberStatus: ClubMemberStatus.ACTIVE },
  },
  under_creation: {
    key: "under_creation",
    label: "Oprettelse",
    colorClass: "text-sky-400",
    where: { memberStatus: ClubMemberStatus.NEW },
  },
  resigned: {
    key: "resigned",
    label: "Udmeldte",
    colorClass: "text-rose-400",
    where: { memberStatus: ClubMemberStatus.RESIGNED },
  },
  senior: {
    key: "senior",
    label: "Senior",
    where: { 
      memberStatus: { not: ClubMemberStatus.NEW },
      membershipType: ClubMemberMembershipType.SENIOR 
    },
  },
  junior: {
    key: "junior",
    label: "Junior",
    where: { 
      memberStatus: { not: ClubMemberStatus.NEW },
      membershipType: ClubMemberMembershipType.JUNIOR 
    },
  },
  passive: {
    key: "passive",
    label: "Passive",
    where: { 
      memberStatus: { not: ClubMemberStatus.NEW },
      membershipType: ClubMemberMembershipType.PASSIVE 
    },
  },
  approved: {
    key: "approved",
    label: "Godkendte",
    colorClass: "text-emerald-400",
    where: { 
      memberStatus: { not: ClubMemberStatus.NEW },
      schoolStatus: ClubMemberSchoolStatus.APPROVED 
    },
  },
  student: {
    key: "student",
    label: "Elever",
    colorClass: "text-amber-400",
    where: { 
      memberStatus: { not: ClubMemberStatus.NEW },
      schoolStatus: ClubMemberSchoolStatus.STUDENT 
    },
  },
  not_approved: {
    key: "not_approved",
    label: "Ikke godk.",
    colorClass: "text-rose-400",
    where: { 
      memberStatus: { not: ClubMemberStatus.NEW },
      schoolStatus: ClubMemberSchoolStatus.NOT_APPROVED 
    },
  },
  instructor: {
    key: "instructor",
    label: "Instruktør",
    colorClass: "text-violet-400",
    where: { 
      memberStatus: { not: ClubMemberStatus.NEW },
      isInstructor: true 
    },
  },
};
