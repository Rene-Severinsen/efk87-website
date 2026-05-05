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
  ClubRole,
  MembershipStatus
} from "@/generated/prisma";
import { getNextMemberNumber } from "../members/memberNumberService";

export type AdminMemberActionResponse = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function createAdminMemberAction(
  clubSlug: string,
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

  const getDate = (key: string) => {
    const val = formData.get(key) as string | null;
    if (!val) return null;
    const date = new Date(val);
    return isNaN(date.getTime()) ? null : date;
  };

  const email = getString("email");
  const firstName = getString("firstName");
  const lastName = getString("lastName");

  if (!email) {
    return { error: "Valideringsfejl", fieldErrors: { email: "Email er påkrævet" } };
  }
  if (!firstName) {
    return { error: "Valideringsfejl", fieldErrors: { firstName: "Fornavn er påkrævet" } };
  }
  if (!lastName) {
    return { error: "Valideringsfejl", fieldErrors: { lastName: "Efternavn er påkrævet" } };
  }

  const addressLine = getString("addressLine");
  const postalCode = getString("postalCode");
  const city = getString("city");
  const mobilePhone = getString("mobilePhone");
  const mdkNumber = getString("mdkNumber");
  const birthDate = getDate("birthDate");
  const joinedAt = getDate("joinedAt") || new Date(); // Default today if empty
  
  const membershipType = formData.get("membershipType") as ClubMemberMembershipType || ClubMemberMembershipType.SENIOR;

  // Validate mdkNumber based on membershipType
  if ((membershipType === ClubMemberMembershipType.SENIOR || membershipType === ClubMemberMembershipType.JUNIOR) && !mdkNumber) {
    return { 
      error: "Valideringsfejl", 
      fieldErrors: { mdkNumber: "MDK nummer er påkrævet for Senior og Junior." } 
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get or create User
      let user = await tx.user.findUnique({
        where: { email }
      });

      if (!user) {
        user = await tx.user.create({
          data: {
            email,
            name: `${firstName} ${lastName}`.trim()
          }
        });
      }

      // 2. Check if profile already exists for this club
      const existingProfile = await tx.clubMemberProfile.findUnique({
        where: {
          clubId_userId: {
            clubId: club.id,
            userId: user.id
          }
        }
      });

      if (existingProfile) {
        return { error: "Der findes allerede en medlemsprofil for denne email i klubben." };
      }

      // 3. Handle ClubMembership
      const existingMembership = await tx.clubMembership.findUnique({
        where: {
          clubId_userId: {
            clubId: club.id,
            userId: user.id
          }
        }
      });

      if (!existingMembership) {
        await tx.clubMembership.create({
          data: {
            clubId: club.id,
            userId: user.id,
            role: ClubRole.MEMBER,
            status: MembershipStatus.ACTIVE
          }
        });
      }

      // 4. Calculate next memberNumber
      // Note: We use the service but inside transaction we might want to be more careful,
      // however getNextMemberNumber uses aggregate max which is fine for most cases.
      // If we want to be super safe against race conditions, we can retry on P2002.
      const memberNumber = await getNextMemberNumber(club.id);

      // 5. Create Profile
      await tx.clubMemberProfile.create({
        data: {
          clubId: club.id,
          userId: user.id,
          firstName,
          lastName,
          addressLine,
          postalCode,
          city,
          mobilePhone,
          memberNumber,
          mdkNumber,
          membershipType,
          memberRoleType: ClubMemberRoleType.REGULAR,
          schoolStatus: ClubMemberSchoolStatus.STUDENT,
          memberStatus: ClubMemberStatus.ACTIVE,
          isInstructor: false,
          birthDate,
          joinedAt,
        }
      });

      return { success: true };
    });

    if (result.error) {
      return result;
    }

  } catch (err) {
    // Handle race condition for memberNumber
    if (err && typeof err === 'object' && 'code' in err && err.code === 'P2002') {
      const meta = (err as { meta?: { target?: string[] } }).meta;
      if (meta?.target?.includes('memberNumber')) {
        // Simple retry once for memberNumber
        try {
          const memberNumber = await getNextMemberNumber(club.id);
          await prisma.clubMemberProfile.create({
            data: {
              clubId: club.id,
              userId: (await prisma.user.findUnique({ where: { email } }))!.id,
              firstName: firstName!,
              lastName: lastName!,
              addressLine,
              postalCode,
              city,
              mobilePhone,
              memberNumber,
              mdkNumber,
              membershipType,
              memberRoleType: ClubMemberRoleType.REGULAR,
              schoolStatus: ClubMemberSchoolStatus.STUDENT,
              memberStatus: ClubMemberStatus.ACTIVE,
              isInstructor: false,
              birthDate,
              joinedAt,
            }
          });
          // revalidate and redirect below
        } catch (retryErr) {
          console.error("Retry failed for memberNumber assignment:", retryErr);
          return { error: "Der opstod en fejl ved tildeling af medlemsnummer. Prøv venligst igen." };
        }
      } else {
        return { error: "En unik begrænsning blev overtrådt. Prøv venligst igen." };
      }
    }
    throw err;
  }

  revalidatePath(`/${clubSlug}/admin/medlemmer`);
  redirect(`/${clubSlug}/admin/medlemmer`);
}
