import { auth } from "../../auth";
import prisma from "../db/prisma";
import { 
  MembershipStatus, 
  ClubRole 
} from "../../generated/prisma";
import { ViewerVisibilityContext } from "../publicSite/publicVisibility";

export type ServerViewerContext = {
  isAuthenticated: boolean;
  isMember: boolean;
  isAdmin: boolean;
  userId?: string;
  email?: string;
  name?: string | null;
  clubId?: string;
  membershipStatus?: MembershipStatus;
  clubRole?: ClubRole;
  isPlatformAdmin?: boolean;
};

export async function getServerViewerForClub(clubId: string): Promise<ServerViewerContext> {
  const session = await auth();

  const anonymousViewer: ServerViewerContext = {
    isAuthenticated: false,
    isMember: false,
    isAdmin: false,
    isPlatformAdmin: false,
  };

  if (!session?.user?.email) {
    return anonymousViewer;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      memberships: {
        where: { clubId },
      },
    },
  });

  if (!user) {
    return {
      isAuthenticated: true,
      isMember: false,
      isAdmin: false,
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
      isPlatformAdmin: false,
    };
  }

  const membership = user.memberships[0];

  if (!membership) {
    return {
      isAuthenticated: true,
      isMember: false,
      isAdmin: false,
      userId: user.id,
      email: user.email,
      name: user.name,
      clubId,
      isPlatformAdmin: false,
    };
  }

  const isMember = membership.status === MembershipStatus.ACTIVE;
  const isAdmin = isMember && (membership.role === ClubRole.ADMIN || membership.role === ClubRole.OWNER);

  return {
    isAuthenticated: true,
    isMember,
    isAdmin,
    userId: user.id,
    email: user.email,
    name: user.name,
    clubId,
    membershipStatus: membership.status,
    clubRole: membership.role,
    isPlatformAdmin: false,
  };
}

export function toViewerVisibilityContext(viewer: ServerViewerContext): ViewerVisibilityContext {
  return {
    isAuthenticated: viewer.isAuthenticated,
    isMember: viewer.isMember,
    isAdmin: viewer.isAdmin,
  };
}
