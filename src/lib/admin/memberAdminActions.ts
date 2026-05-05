"use server";

import prisma from "../db/prisma";
import { getServerViewerForClub } from "@/lib/auth/viewer";
import { getClubBySlug } from "@/lib/tenancy/tenantService";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { saveMemberProfilePhoto } from "@/lib/storage/storageService";
import { 
  ClubMemberMembershipType, 
  ClubMemberRoleType, 
  ClubMemberSchoolStatus, 
  ClubMemberStatus,
  ClubMemberCertificateType
} from "@/generated/prisma";

export type AdminMemberActionResponse = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function updateAdminMemberProfileAction(
  clubSlug: string,
  userId: string,
  prevState: AdminMemberActionResponse | null,
  formData: FormData
): Promise<AdminMemberActionResponse> {
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
  const email = getString("email")?.toLowerCase().trim();
  const addressLine = getString("addressLine");
  const postalCode = getString("postalCode");
  const city = getString("city");
  const mobilePhone = getString("mobilePhone");
  const mdkNumber = getString("mdkNumber");

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      fieldErrors: {
        email: "Indtast en gyldig e-mailadresse.",
      },
    };
  }
  // memberNumber is now auto-assigned and not editable from edit form

  let profileImageUrl = getString("profileImageUrl");
  const profilePhotoFile = formData.get("profilePhoto") as File | null;
  const shouldRemovePhoto = formData.get("removeProfilePhoto") === "true";

  if (shouldRemovePhoto) {
    profileImageUrl = null;
  } else if (profilePhotoFile && profilePhotoFile.size > 0) {
    const uploadResult = await saveMemberProfilePhoto(club.id, userId, profilePhotoFile);
    if (uploadResult.error) {
      return { error: uploadResult.error };
    }
    if (uploadResult.url) {
      profileImageUrl = uploadResult.url;
    }
  }

  const birthDate = getDate("birthDate");
  const membershipType = formData.get("membershipType") as ClubMemberMembershipType;
  const memberRoleType = formData.get("memberRoleType") as ClubMemberRoleType;
  const schoolStatus = formData.get("schoolStatus") as ClubMemberSchoolStatus;
  const memberStatus = formData.get("memberStatus") as ClubMemberStatus;
  const isInstructor = getBoolean("isInstructor");

  // Certificates
  const certificateTypes = Object.values(ClubMemberCertificateType);
  const selectedCertificates = certificateTypes.filter(type => formData.get(`cert_${type}`) === "on");

  try {
    await prisma.$transaction(async (tx) => {
      // Update User email if changed
      if (email) {
        // Check if email is already in use by another user
        const existingUser = await tx.user.findFirst({
          where: {
            email,
            id: { not: userId }
          }
        });

        if (existingUser) {
          throw new Error("EMAIL_ALREADY_IN_USE");
        }

        await tx.user.update({
          where: { id: userId },
          data: { 
            email,
            name: (firstName || lastName) ? `${firstName ?? ""} ${lastName ?? ""}`.trim() : undefined
          },
        });
      }

      const existingProfile = await tx.clubMemberProfile.findUnique({
        where: {
          clubId_userId: {
            clubId: club.id,
            userId,
          },
        },
        select: {
          memberStatus: true,
          joinedAt: true,
        },
      });

      if (!existingProfile) {
        throw new Error("MEMBER_PROFILE_NOT_FOUND");
      }

      const shouldSetJoinedAtOnFirstActivation =
        existingProfile.memberStatus === ClubMemberStatus.NEW &&
        memberStatus === ClubMemberStatus.ACTIVE &&
        existingProfile.joinedAt === null;

      const effectiveJoinedAt = shouldSetJoinedAtOnFirstActivation
        ? new Date()
        : existingProfile.joinedAt;

      // Update Profile
      await tx.clubMemberProfile.update({
        where: {
          clubId_userId: {
            clubId: club.id,
            userId,
          },
        },
        data: {
          firstName,
          lastName,
          addressLine,
          postalCode,
          city,
          mobilePhone,
          mdkNumber,
          profileImageUrl,
          membershipType,
          memberRoleType,
          schoolStatus,
          memberStatus,
          isInstructor,
          birthDate,
          joinedAt: effectiveJoinedAt,
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
  } catch (err) {
    if (err instanceof Error && err.message === "EMAIL_ALREADY_IN_USE") {
      return {
        fieldErrors: {
          email: "Denne e-mailadresse er allerede i brug af et andet medlem.",
        },
      };
    }
    throw err;
  }

  revalidatePath(`/${clubSlug}/admin/medlemmer`);
  revalidatePath(`/${clubSlug}/admin/medlemmer/${userId}/rediger`);
  revalidatePath(`/${clubSlug}/profil`);
  
  redirect(`/${clubSlug}/admin/medlemmer`);
}
