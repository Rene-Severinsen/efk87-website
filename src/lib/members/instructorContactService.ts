import prisma from "../db/prisma";

export interface PublicInstructorContactDTO {
  displayName: string;
  profileImageUrl: string | null;
  email: string | null;
  mobilePhone: string | null;
  memberRoleType: string | null;
  schoolStatus: string | null;
}

/**
 * Gets public contact information for instructors in a specific club.
 * Only shows ACTIVE members marked as isInstructor.
 */
export async function getPublicInstructorContacts(clubId: string): Promise<PublicInstructorContactDTO[]> {
  const instructors = await prisma.clubMemberProfile.findMany({
    where: {
      clubId,
      isInstructor: true,
      memberStatus: "ACTIVE",
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
      { firstName: 'asc' },
      { lastName: 'asc' },
    ],
  });

  return instructors.map(instructor => ({
    displayName: instructor.user.name || `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || 'Instruktør',
    profileImageUrl: instructor.profileImageUrl,
    email: instructor.user.email,
    mobilePhone: instructor.mobilePhone,
    memberRoleType: instructor.memberRoleType,
    schoolStatus: instructor.schoolStatus,
  }));
}
