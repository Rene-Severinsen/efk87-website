import { ClubMemberCertificateType, ClubMemberSchoolStatus, ClubMemberRoleType, ClubMemberMembershipType, ClubMemberStatus } from "@/generated/prisma";

export const SCHOOL_STATUS_LABELS: Record<ClubMemberSchoolStatus, string> = {
  [ClubMemberSchoolStatus.APPROVED]: "Godkendt",
  [ClubMemberSchoolStatus.STUDENT]: "Elev i flyveskolen",
  [ClubMemberSchoolStatus.NOT_APPROVED]: "Ikke godkendt",
};

export const CERTIFICATE_LABELS: Record<ClubMemberCertificateType, string> = {
  [ClubMemberCertificateType.A_CERTIFICATE]: "A-certifikat",
  [ClubMemberCertificateType.A_CONTROLLER]: "A-kontrollant",
  [ClubMemberCertificateType.A_LARGE_MODEL]: "A-stormodel",
  [ClubMemberCertificateType.A_LARGE_MODEL_CONTROLLER]: "A-stormodel kontrollant",
  [ClubMemberCertificateType.S_CERTIFICATE]: "S-certifikat",
  [ClubMemberCertificateType.S_CONTROLLER]: "S-kontrollant",
  [ClubMemberCertificateType.S_LARGE_MODEL]: "S-stormodel",
  [ClubMemberCertificateType.S_LARGE_MODEL_CONTROLLER]: "S-stormodel kontrollant",
  [ClubMemberCertificateType.H_CERTIFICATE]: "H-certifikat",
  [ClubMemberCertificateType.H_CONTROLLER]: "H-kontrollant",
  [ClubMemberCertificateType.H_LARGE_MODEL]: "H-stormodel",
  [ClubMemberCertificateType.H_LARGE_MODEL_CONTROLLER]: "H-stormodel kontrollant",
  [ClubMemberCertificateType.J_LARGE_MODEL]: "J-stormodel",
  [ClubMemberCertificateType.J_LARGE_MODEL_CONTROLLER]: "J-stormodel kontrollant",
};

export const MEMBERSHIP_TYPE_LABELS: Record<ClubMemberMembershipType, string> = {
  [ClubMemberMembershipType.SENIOR]: "Senior",
  [ClubMemberMembershipType.JUNIOR]: "Junior",
  [ClubMemberMembershipType.PASSIVE]: "Passiv",
};

export const ROLE_TYPE_LABELS: Record<ClubMemberRoleType, string> = {
  [ClubMemberRoleType.REGULAR]: "Almindelig medlem",
  [ClubMemberRoleType.BOARD_MEMBER]: "Bestyrelsesmedlem",
  [ClubMemberRoleType.BOARD_SUPPLEANT]: "Bestyrelsessuppleant",
  [ClubMemberRoleType.TREASURER]: "Kasserer",
  [ClubMemberRoleType.CHAIRMAN]: "Formand",
  [ClubMemberRoleType.VICE_CHAIRMAN]: "Næstformand",
};

export const MEMBER_STATUS_LABELS: Record<ClubMemberStatus, string> = {
  [ClubMemberStatus.ACTIVE]: "Aktiv",
  [ClubMemberStatus.RESIGNED]: "Udmeldt",
  [ClubMemberStatus.NEW]: "Under oprettelse",
};

export const ALL_CERTIFICATE_TYPES = Object.values(ClubMemberCertificateType);
