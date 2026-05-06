"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma";
import {
  ClubMemberMembershipType,
  ClubMemberRoleType,
  ClubMemberSchoolStatus,
  ClubMemberStatus,
  ClubRole,
  MembershipStatus,
} from "@/generated/prisma";
import { getNextMemberNumber } from "@/lib/members/memberNumberService";

export type PublicMemberSignupState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitPublicMemberSignupAction(
  clubSlug: string,
  prevState: PublicMemberSignupState,
  formData: FormData,
): Promise<PublicMemberSignupState> {
  const club = await prisma.club.findUnique({
    where: { slug: clubSlug },
    select: { id: true },
  });

  if (!club) {
    return { error: "Klubben blev ikke fundet." };
  }

  const firstName = formData.get("firstName")?.toString().trim() || "";
  const lastName = formData.get("lastName")?.toString().trim() || "";
  const addressLine = formData.get("address")?.toString().trim() || "";
  const postalCode = formData.get("postalCode")?.toString().trim() || "";
  const city = formData.get("city")?.toString().trim() || "";
  const mobilePhone = formData.get("mobilePhone")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim().toLowerCase() || "";
  const birthDateStr = formData.get("birthDate")?.toString() || "";
  const membershipTypeStr = formData.get("membershipType")?.toString() || "";
  const mdkNumber = formData.get("mdkNumber")?.toString().trim() || "";

  const fieldErrors: Record<string, string> = {};

  if (!firstName) fieldErrors.firstName = "Fornavn er påkrævet";
  if (!lastName) fieldErrors.lastName = "Efternavn er påkrævet";
  if (!addressLine) fieldErrors.address = "Adresse er påkrævet";
  if (!postalCode) {
    fieldErrors.postalCode = "Postnummer er påkrævet";
  } else if (!/^\d{4}$/.test(postalCode)) {
    fieldErrors.postalCode = "Postnummer skal være 4 cifre.";
  }
  if (!city) fieldErrors.city = "By er påkrævet";
  if (!email) {
    fieldErrors.email = "E-mail er påkrævet";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Indtast en gyldig e-mailadresse.";
  }
  if (!mobilePhone) {
    fieldErrors.mobilePhone = "Mobilnummer er påkrævet";
  } else if (!/^\d+$/.test(mobilePhone)) {
    fieldErrors.mobilePhone = "Mobilnummer må kun indeholde tal.";
  }
  if (!birthDateStr) fieldErrors.birthDate = "Fødselsdato er påkrævet";
  if (!membershipTypeStr) fieldErrors.membershipType = "Medlemskab er påkrævet";

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const birthDate = new Date(birthDateStr);
  if (Number.isNaN(birthDate.getTime())) {
    return { fieldErrors: { birthDate: "Ugyldig fødselsdato" } };
  }

  const membershipType = membershipTypeStr as ClubMemberMembershipType;
  if (!Object.values(ClubMemberMembershipType).includes(membershipType)) {
    return { error: "Ugyldig medlemskabstype" };
  }

  if (
    (membershipType === ClubMemberMembershipType.SENIOR ||
      membershipType === ClubMemberMembershipType.JUNIOR) &&
    !mdkNumber
  ) {
    return { fieldErrors: { mdkNumber: "MDK nr. er påkrævet for Senior og Junior" } };
  }

  if (mdkNumber && !/^\d{4}$/.test(mdkNumber)) {
    return { fieldErrors: { mdkNumber: "MDK nr. skal være 4 cifre." } };
  }

  if (mdkNumber) {
    const existingMdkProfile = await prisma.clubMemberProfile.findFirst({
      where: {
        clubId: club.id,
        mdkNumber,
      },
      select: {
        id: true,
      },
    });

    if (existingMdkProfile) {
      return {
        fieldErrors: {
          mdkNumber: "Dette MDK nr. er allerede registreret i klubben.",
        },
      };
    }
  }

  const currentYear = new Date().getFullYear();
  const birthYear = birthDate.getFullYear();
  const ageInCalendarYear = currentYear - birthYear;

  if (membershipType === ClubMemberMembershipType.SENIOR && ageInCalendarYear < 18) {
    return { fieldErrors: { membershipType: "Ud fra fødselsåret skal medlemskabet være Junior." } };
  }

  if (membershipType === ClubMemberMembershipType.JUNIOR && ageInCalendarYear >= 18) {
    return { fieldErrors: { membershipType: "Ud fra fødselsåret skal medlemskabet være Senior." } };
  }

  const existingProfile = await prisma.clubMemberProfile.findFirst({
    where: {
      clubId: club.id,
      OR: [
        { user: { email } },
        {
          mobilePhone,
          firstName,
          lastName,
          birthDate: { equals: birthDate },
        },
      ],
    },
    include: {
      user: {
        select: { email: true },
      },
    },
  });

  if (existingProfile) {
    if (existingProfile.user.email === email) {
      return {
        error:
          "Der findes allerede et medlem med samme e-mailadresse. Kontakt klubben, hvis du er i tvivl.",
      };
    }

    return {
      error:
        "Der findes allerede et medlem med tilsvarende oplysninger. Kontakt klubben, hvis du er i tvivl.",
    };
  }

  try {
    const memberNumber = await getNextMemberNumber(club.id);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { email },
        create: {
          email,
          name: `${firstName} ${lastName}`.trim(),
        },
        update: {
          name: `${firstName} ${lastName}`.trim(),
        },
      });

      await tx.clubMembership.upsert({
        where: {
          clubId_userId: {
            clubId: club.id,
            userId: user.id,
          },
        },
        create: {
          clubId: club.id,
          userId: user.id,
          role: ClubRole.MEMBER,
          status: MembershipStatus.ACTIVE,
        },
        update: {},
      });

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
          mdkNumber: mdkNumber || null,
          membershipType,
          memberRoleType: ClubMemberRoleType.REGULAR,
          schoolStatus: ClubMemberSchoolStatus.STUDENT,
          memberStatus: ClubMemberStatus.NEW,
          isInstructor: false,
          birthDate,
          joinedAt: null,
        },
      });
    });

    revalidatePath(`/${clubSlug}/admin/medlemmer`);
    return { success: true };
  } catch (error) {
    console.error("Failed to create public member profile:", error);
    return {
      error:
        "Der skete en fejl ved gemning af din indmeldelse. Prøv venligst igen senere.",
    };
  }
}
