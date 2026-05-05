import prisma from "../db/prisma";
import { ClubMemberCertificateType } from "@/generated/prisma";

export interface MemberProfileDTO {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  addressLine: string | null;
  postalCode: string | null;
  city: string | null;
  mobilePhone: string | null;
  email: string | null;
  memberNumber: number | null;
  mdkNumber: string | null;
  profileImageUrl: string | null;
  membershipType: string;
  memberRoleType: string;
  schoolStatus: string;
  memberStatus: string;
  isInstructor: boolean;
  birthDate: Date | null;
  joinedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  certificates: ClubMemberCertificateType[];
}

export async function getOwnMemberProfile(clubId: string, userId: string): Promise<MemberProfileDTO | null> {
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
    userId: profile.userId,
    firstName: profile.firstName,
    lastName: profile.lastName,
    addressLine: profile.addressLine,
    postalCode: profile.postalCode,
    city: profile.city,
    mobilePhone: profile.mobilePhone,
    email: profile.user.email,
    memberNumber: profile.memberNumber,
    mdkNumber: profile.mdkNumber,
    profileImageUrl: profile.profileImageUrl,
    membershipType: profile.membershipType,
    memberRoleType: profile.memberRoleType,
    schoolStatus: profile.schoolStatus,
    memberStatus: profile.memberStatus,
    isInstructor: profile.isInstructor,
    birthDate: profile.birthDate,
    joinedAt: profile.joinedAt,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    certificates: certificates.map((c) => c.certificateType),
  };
}

export async function getOrCreateOwnMemberProfile(clubId: string, userId: string): Promise<MemberProfileDTO> {
  const existing = await getOwnMemberProfile(clubId, userId);
  if (existing) return existing;

  // Create default profile
  const profile = await prisma.clubMemberProfile.create({
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
    data: {
      clubId,
      userId,
      memberStatus: "NEW",
      membershipType: "SENIOR",
      memberRoleType: "REGULAR",
      schoolStatus: "NOT_APPROVED",
    },
  });

  return {
    userId: profile.userId,
    firstName: profile.firstName,
    lastName: profile.lastName,
    addressLine: profile.addressLine,
    postalCode: profile.postalCode,
    city: profile.city,
    mobilePhone: profile.mobilePhone,
    email: profile.user.email,
    memberNumber: profile.memberNumber,
    mdkNumber: profile.mdkNumber,
    profileImageUrl: profile.profileImageUrl,
    membershipType: profile.membershipType,
    memberRoleType: profile.memberRoleType,
    schoolStatus: profile.schoolStatus,
    memberStatus: profile.memberStatus,
    isInstructor: profile.isInstructor,
    birthDate: profile.birthDate,
    joinedAt: profile.joinedAt,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    certificates: [],
  };
}

export async function getMemberProfileCertificates(clubId: string, userId: string): Promise<ClubMemberCertificateType[]> {
  const certificates = await prisma.clubMemberCertificate.findMany({
    where: {
      clubId,
      userId,
    },
    select: {
      certificateType: true,
    },
  });

  return certificates.map((c) => c.certificateType);
}

export async function getMemberProfileId(clubId: string, userId: string): Promise<string | null> {
  const profile = await prisma.clubMemberProfile.findUnique({
    where: {
      clubId_userId: {
        clubId,
        userId,
      },
    },
    select: { id: true },
  });
  return profile?.id ?? null;
}

export interface MemberDirectoryItemDTO {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  addressLine: string | null;
  postalCode: string | null;
  city: string | null;
  mobilePhone: string | null;
  email: string | null;
  memberNumber: number | null;
  mdkNumber: string | null;
  profileImageUrl: string | null;
  certificates: ClubMemberCertificateType[];
}

export async function getMemberDirectoryForClub(clubId: string): Promise<MemberDirectoryItemDTO[]> {
  const profiles = await prisma.clubMemberProfile.findMany({
    where: {
      clubId,
      memberStatus: "ACTIVE",
    },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
    orderBy: [
      { firstName: "asc" },
      { lastName: "asc" },
    ],
  });

  const certificates = await prisma.clubMemberCertificate.findMany({
    where: {
      clubId,
      userId: {
        in: profiles.map((profile) => profile.userId),
      },
    },
    select: {
      userId: true,
      certificateType: true,
    },
  });

  const certificatesByUserId = new Map<string, ClubMemberCertificateType[]>();

  for (const certificate of certificates) {
    const existing = certificatesByUserId.get(certificate.userId) ?? [];
    existing.push(certificate.certificateType);
    certificatesByUserId.set(certificate.userId, existing);
  }

  return profiles.map((profile) => ({
    userId: profile.userId,
    firstName: profile.firstName,
    lastName: profile.lastName,
    addressLine: profile.addressLine,
    postalCode: profile.postalCode,
    city: profile.city,
    mobilePhone: profile.mobilePhone,
    email: profile.user.email,
    memberNumber: profile.memberNumber,
    mdkNumber: profile.mdkNumber,
    profileImageUrl: profile.profileImageUrl,
    certificates: certificatesByUserId.get(profile.userId) ?? [],
  }));
}