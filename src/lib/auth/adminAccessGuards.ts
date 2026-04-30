import { redirect } from "next/navigation";
import { getServerViewerForClub, ServerViewerContext } from "./viewer";

/**
 * Ensures the current viewer is an active admin or owner of the specified club.
 * 
 * Access rules:
 * - User must be authenticated.
 * - User must have ACTIVE status in current club.
 * - Access granted if:
 *   a) User has legacy ClubRole ADMIN or OWNER in ClubMembership.
 *   b) User has an eligible board role in ClubMemberProfile (CHAIRMAN, TREASURER, etc.).
 * 
 * If not authorized, redirects:
 * - Anonymous: /{clubSlug}/login?reason=admin-required
 * - Authenticated non-admin: /{clubSlug}/login?reason=admin-required (or a dedicated forbidden page in future)
 */
export async function requireClubAdminForClub(
  clubId: string, 
  clubSlug: string,
  callbackUrl?: string
): Promise<ServerViewerContext> {
  const viewer = await getServerViewerForClub(clubId);

  if (viewer.isAdmin) {
    return viewer;
  }

  // Not an admin or not authenticated
  // Using same redirect pattern as requireActiveMemberForClub but with admin-required reason
  const loginUrl = new URL(`/${clubSlug}/login`, "http://localhost");
  loginUrl.searchParams.set("reason", "admin-required");
  if (callbackUrl) {
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
  }

  redirect(loginUrl.pathname + loginUrl.search);
}
