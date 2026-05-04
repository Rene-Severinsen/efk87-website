import { ClubMemberRoleType } from "@/generated/prisma";
import prisma from "../db/prisma";

export interface PublicInstructorContactDTO {
  id: string;
  displayName: string;
  profileImageUrl: string | null;
  email: string | null;
  mobilePhone: string | null;
  memberRoleType: string | null;
  schoolStatus: string | null;
  isInstructor: boolean;
}

/**
 * Gets public contact information for the club contact page.
 * Includes ACTIVE members who are either instructors or primary board contacts.
 */
export async function getPublicInstructorContacts(clubId: string): Promise<PublicInstructorContactDTO[]> {
  const contacts = await prisma.clubMemberProfile.findMany({
    where: {
      clubId,
      memberStatus: "ACTIVE",
      OR: [
        {
          isInstructor: true,
        },
        {
          memberRoleType: {
            in: [
              ClubMemberRoleType.CHAIRMAN,
              ClubMemberRoleType.TREASURER,
            ],
          },
        },
      ],
    },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
    orderBy: [
      { firstName: "asc" },
      { lastName: "asc" },
    ],
  });

  return contacts.map((contact) => ({
    id: contact.id,
    displayName:
        contact.user.name ||
        `${contact.firstName || ""} ${contact.lastName || ""}`.trim() ||
        "Kontaktperson",
    profileImageUrl: contact.profileImageUrl,
    email: contact.user.email,
    mobilePhone: contact.mobilePhone,
    memberRoleType: contact.memberRoleType,
    schoolStatus: contact.schoolStatus,
    isInstructor: contact.isInstructor,
  }));
}