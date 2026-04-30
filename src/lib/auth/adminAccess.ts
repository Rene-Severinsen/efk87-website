import { 
  ClubMemberRoleType, 
  ClubMemberStatus,
  ClubRole,
  MembershipStatus
} from "@/generated/prisma";
import prisma from "@/lib/db/prisma";

/**
 * Checks if a club member role is eligible for admin access.
 * 
 * Eligible roles:
 * - chairman (CHAIRMAN)
 * - vice chairman (VICE_CHAIRMAN)
 * - board member (BOARD_MEMBER)
 * - treasurer (TREASURER)
 */
export function isAdminEligibleMemberRole(role: ClubMemberRoleType): boolean {
  const eligibleRoles: ClubMemberRoleType[] = [
    ClubMemberRoleType.CHAIRMAN,
    ClubMemberRoleType.VICE_CHAIRMAN,
    ClubMemberRoleType.BOARD_MEMBER,
    ClubMemberRoleType.TREASURER,
  ];
  return eligibleRoles.includes(role);
}

/**
 * Checks if a user has club admin access for a specific club.
 * 
 * Access is granted if:
 * 1. User is a platform/dev admin (currently none defined)
 * 2. User has an ACTIVE ClubMembership with role ADMIN or OWNER
 * 3. User has an ACTIVE ClubMemberProfile with an eligible board role
 * 
 * canAccess = existingDevOrPlatformAdminAccess OR tenantScopedClubRoleAdminAccess
 */
export async function canAccessClubAdmin(userId: string | undefined, clubId: string | undefined): Promise<boolean> {
  if (!userId || !clubId) return false;

  // 1. Existing platform/dev admin override
  // Preserve existing logic (currently placeholder isPlatformAdmin: false in viewer.ts)
  const isPlatformAdmin = false; 
  if (isPlatformAdmin) return true;

  // 2. Tenant-scoped club role admin access
  const [membership, profile] = await Promise.all([
    prisma.clubMembership.findUnique({
      where: {
        clubId_userId: {
          clubId,
          userId,
        },
      },
      select: {
        role: true,
        status: true,
      }
    }),
    prisma.clubMemberProfile.findUnique({
      where: {
        clubId_userId: {
          clubId,
          userId,
        },
      },
      select: {
        memberRoleType: true,
        memberStatus: true,
      }
    }),
  ]);

  // Check ClubMembership (OWNER/ADMIN)
  if (membership && 
      membership.status === MembershipStatus.ACTIVE && 
      (membership.role === ClubRole.ADMIN || membership.role === ClubRole.OWNER)) {
    return true;
  }

  // Check ClubMemberProfile (Board roles)
  if (profile && 
      profile.memberStatus === ClubMemberStatus.ACTIVE && 
      isAdminEligibleMemberRole(profile.memberRoleType)) {
    return true;
  }

  return false;
}

/**
 * Naming as per requirements: requireClubAdminAccess
 */
export async function requireClubAdminAccess(userId: string, clubId: string): Promise<void> {
  const hasAccess = await canAccessClubAdmin(userId, clubId);
  if (!hasAccess) {
    throw new Error("Unauthorized: Club admin access required");
  }
}
