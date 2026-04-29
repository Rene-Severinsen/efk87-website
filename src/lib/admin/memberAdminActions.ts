"use server";

import prisma from "../db/prisma";
import { getServerViewerForClub } from "@/lib/auth/viewer";
import { getClubBySlug } from "@/lib/tenancy/tenantService";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { 
  ClubMemberMembershipType, 
  ClubMemberRoleType, 
  ClubMemberSchoolStatus, 
  ClubMemberStatus,
  ClubMemberCertificateType
} from "@/generated/prisma";

export async function updateAdminMemberProfileAction(
  clubSlug: string,
  userId: string,
  formData: FormData
) {
  const club = await getClubBySlug(clubSlug);
  if (!club) throw new Error("Club not found");

  const viewer = await getServerViewerForClub(club.id);
  if (!viewer.isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  const getString = (key: string) => {
    const val = formData.get(key) as string | null;
    if (val === "" || val === null) return null;
    return val;
  };

  const getBoolean = (key: string) => formData.get(key) === "on";

  const getDate = (key: string) => {
    const val = formData.get(key) as string | null;
    if (!val) return null;
    const date = new Date(val);
    return isNaN(date.getTime()) ? null : date;
  };

  const firstName = getString("firstName");
  const lastName = getString("lastName");
  const addressLine = getString("addressLine");
  const postalCode = getString("postalCode");
  const city = getString("city");
  const mobilePhone = getString("mobilePhone");
  const mdkNumber = getString("mdkNumber");
  const memberNumberRaw = getString("memberNumber");
  const memberNumber = memberNumberRaw ? parseInt(memberNumberRaw, 10) : null;

  if (memberNumber !== null && (isNaN(memberNumber) || memberNumber <= 0)) {
    throw new Error("Medlemsnummer skal være et positivt heltal");
  }

  const profileImageUrl = getString("profileImageUrl");
  const birthDate = getDate("birthDate");
  const joinedAt = getDate("joinedAt");
  
  const membershipType = formData.get("membershipType") as ClubMemberMembershipType;
  const memberRoleType = formData.get("memberRoleType") as ClubMemberRoleType;
  const schoolStatus = formData.get("schoolStatus") as ClubMemberSchoolStatus;
  const memberStatus = formData.get("memberStatus") as ClubMemberStatus;
  const isInstructor = getBoolean("isInstructor");

  // Certificates
  const certificateTypes = Object.values(ClubMemberCertificateType);
  const selectedCertificates = certificateTypes.filter(type => formData.get(`cert_${type}`) === "on");

  await prisma.$transaction(async (tx) => {
    // Check for unique memberNumber within the club
    if (memberNumber !== null) {
      const existing = await tx.clubMemberProfile.findFirst({
        where: {
          clubId: club.id,
          memberNumber,
          userId: {
            not: userId,
          },
        },
      });

      if (existing) {
        throw new Error(`Medlemsnummer ${memberNumber} er allerede i brug i denne klub.`);
      }
    }

    // Update Profile
    await tx.clubMemberProfile.upsert({
      where: {
        clubId_userId: {
          clubId: club.id,
          userId,
        },
      },
      update: {
        firstName,
        lastName,
        addressLine,
        postalCode,
        city,
        mobilePhone,
        memberNumber,
        mdkNumber,
        profileImageUrl,
        membershipType,
        memberRoleType,
        schoolStatus,
        memberStatus,
        isInstructor,
        birthDate,
        joinedAt,
      },
      create: {
        clubId: club.id,
        userId,
        firstName,
        lastName,
        addressLine,
        postalCode,
        city,
        mobilePhone,
        memberNumber,
        mdkNumber,
        profileImageUrl,
        membershipType,
        memberRoleType,
        schoolStatus,
        memberStatus,
        isInstructor,
        birthDate,
        joinedAt,
      },
    });

    // Update Certificates
    // 1. Remove unchecked ones
    await tx.clubMemberCertificate.deleteMany({
      where: {
        clubId: club.id,
        userId,
        certificateType: {
          notIn: selectedCertificates,
        },
      },
    });

    // 2. Add checked ones (using upsert to avoid duplicates)
    for (const certType of selectedCertificates) {
      await tx.clubMemberCertificate.upsert({
        where: {
          clubId_userId_certificateType: {
            clubId: club.id,
            userId,
            certificateType: certType,
          },
        },
        update: {},
        create: {
          clubId: club.id,
          userId,
          certificateType: certType,
        },
      });
    }
  });

  revalidatePath(`/${clubSlug}/admin/medlemmer`);
  revalidatePath(`/${clubSlug}/admin/medlemmer/${userId}/rediger`);
  revalidatePath(`/${clubSlug}/profil`);
  
  redirect(`/${clubSlug}/admin/medlemmer`);
}
