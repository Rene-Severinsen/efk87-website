import { PublicSurfaceVisibility } from "../../generated/prisma";

export type ViewerVisibilityContext = {
  isAuthenticated: boolean;
  isMember: boolean;
  isAdmin: boolean;
};

export const anonymousViewer: ViewerVisibilityContext = {
  isAuthenticated: false,
  isMember: false,
  isAdmin: false,
};

/**
 * Checks if a surface is viewable by the current viewer.
 * 
 * Rules:
 * - PUBLIC can be viewed by everyone.
 * - MEMBERS_ONLY can be viewed only by authenticated members or admins.
 */
export function canViewSurface(
  visibility: PublicSurfaceVisibility,
  viewer: ViewerVisibilityContext
): boolean {
  if (visibility === "PUBLIC") {
    return true;
  }

  if (visibility === "MEMBERS_ONLY") {
    return viewer.isAuthenticated && (viewer.isMember || viewer.isAdmin);
  }

  return false;
}
