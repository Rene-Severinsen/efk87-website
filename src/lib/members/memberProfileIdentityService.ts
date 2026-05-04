import prisma from "../db/prisma";

export interface MemberProfileIdentity {
  id: string;
  displayName: string | null;
  email: string | null;
}

function buildDisplayName(firstName: string | null, lastName: string | null): string | null {
  const fullName = [firstName, lastName]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || null;
}

export async function getMemberProfileIdentity(
  clubId: string,
  userId: string,
): Promise<MemberProfileIdentity | null> {
  const profile = await prisma.clubMemberProfile.findUnique({
    where: {
      clubId_userId: {
        clubId,
        userId,
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    displayName: buildDisplayName(profile.firstName, profile.lastName) || profile.user.name || profile.user.email,
    email: profile.user.email,
  };
}
