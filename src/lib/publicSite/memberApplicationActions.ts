"use server";

import prisma from "@/lib/db/prisma";
import { 
  ClubMemberMembershipType, 
  ClubMemberStatus, 
  ClubMemberSchoolStatus 
} from "@/generated/prisma";
import { getNextMemberNumber } from "@/lib/members/memberNumberService";
import { revalidatePath } from "next/cache";

export type ApplicationState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitPublicMemberApplicationAction(
  clubSlug: string,
  prevState: ApplicationState,
  formData: FormData
): Promise<ApplicationState> {
  // 1. Get Club
  const club = await prisma.club.findUnique({
    where: { slug: clubSlug },
    select: { id: true }
  });

  if (!club) {
    return { error: "Klubben blev ikke fundet." };
  }

  // 2. Extract and trim fields
  const firstName = formData.get("firstName")?.toString().trim() || "";
  const lastName = formData.get("lastName")?.toString().trim() || "";
  const address = formData.get("address")?.toString().trim() || "";
  const postalCode = formData.get("postalCode")?.toString().trim() || "";
  const city = formData.get("city")?.toString().trim() || "";
  const mobilePhone = formData.get("mobilePhone")?.toString().trim() || "";
  const birthDateStr = formData.get("birthDate")?.toString() || "";
  const membershipTypeStr = formData.get("membershipType")?.toString() || "";
  const mdkNumber = formData.get("mdkNumber")?.toString().trim() || "";

  // 3. Validation
  const fieldErrors: Record<string, string> = {};

  if (!firstName) fieldErrors.firstName = "Fornavn er påkrævet";
  if (!lastName) fieldErrors.lastName = "Efternavn er påkrævet";
  if (!address) fieldErrors.address = "Adresse er påkrævet";
  if (!postalCode) fieldErrors.postalCode = "Postnummer er påkrævet";
  if (!city) fieldErrors.city = "By er påkrævet";
  if (!mobilePhone) fieldErrors.mobilePhone = "Mobilnummer er påkrævet";
  if (!birthDateStr) fieldErrors.birthDate = "Fødselsdato er påkrævet";
  if (!membershipTypeStr) fieldErrors.membershipType = "Medlemskab er påkrævet";

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) {
    return { fieldErrors: { birthDate: "Ugyldig fødselsdato" } };
  }

  const membershipType = membershipTypeStr as ClubMemberMembershipType;
  if (!Object.values(ClubMemberMembershipType).includes(membershipType)) {
    return { error: "Ugyldig medlemskabstype" };
  }

  // MDK nr. validation
  if ((membershipType === ClubMemberMembershipType.SENIOR || membershipType === ClubMemberMembershipType.JUNIOR) && !mdkNumber) {
    return { fieldErrors: { mdkNumber: "MDK nr. er påkrævet for Senior og Junior" } };
  }

  // Senior/Junior rule
  const currentYear = new Date().getFullYear();
  const birthYear = birthDate.getFullYear();
  const ageInCalendarYear = currentYear - birthYear;

  if (membershipType === ClubMemberMembershipType.SENIOR && ageInCalendarYear < 18) {
    return { fieldErrors: { membershipType: "Ud fra fødselsåret skal medlemskabet være Junior." } };
  }
  if (membershipType === ClubMemberMembershipType.JUNIOR && ageInCalendarYear >= 18) {
    return { fieldErrors: { membershipType: "Ud fra fødselsåret skal medlemskabet være Senior." } };
  }

  // 4. Duplicate Check
  // mobile number + firstName + lastName + birthDate
  const existingApp = await prisma.publicMemberApplication.findFirst({
    where: {
      clubId: club.id,
      mobilePhone,
      firstName,
      lastName,
      birthDate: {
        equals: birthDate
      }
    }
  });

  const existingProfile = await prisma.clubMemberProfile.findFirst({
    where: {
      clubId: club.id,
      mobilePhone,
      firstName,
      lastName,
      birthDate: {
        equals: birthDate
      }
    }
  });

  if (existingApp || existingProfile) {
    return { error: "Der findes allerede en ansøgning eller et medlem med tilsvarende oplysninger. Kontakt klubben, hvis du er i tvivl." };
  }

  // 5. Create record
  try {
    // Reserve member number immediately to ensure sequential integrity
    const memberNumber = await getNextMemberNumber(club.id);

    await prisma.publicMemberApplication.create({
      data: {
        clubId: club.id,
        firstName,
        lastName,
        address,
        postalCode,
        city,
        mobilePhone,
        birthDate,
        membershipType,
        mdkNumber: mdkNumber || null,
        memberNumber,
        status: ClubMemberStatus.NEW,
        schoolStatus: ClubMemberSchoolStatus.STUDENT,
      }
    });

    revalidatePath(`/${clubSlug}/admin/medlemmer`);
    return { success: true };
  } catch (e) {
    console.error("Failed to create member application:", e);
    return { error: "Der skete en fejl ved gemning af din ansøgning. Prøv venligst igen senere." };
  }
}
