import { redirect } from "next/navigation";
import { getServerViewerForClub, ServerViewerContext } from "./viewer";
import { publicRoutes } from "../publicRoutes";

/**
 * Ensures the current viewer is an active member of the specified club.
 * 
 * Access rule:
 * - authenticated user
 * - ACTIVE ClubMembership for current club
 * - ADMIN and OWNER also count as members.
 * 
 * If not authorized, redirects to /{clubSlug}/login?reason=member-required
 */
export async function requireActiveMemberForClub(
  clubId: string, 
  clubSlug: string,
  callbackUrl?: string
): Promise<ServerViewerContext> {
  const viewer = await getServerViewerForClub(clubId);

  if (viewer.isMember) {
    return viewer;
  }

  // Not a member or not authenticated
  const loginUrl = new URL(publicRoutes.login(clubSlug), "http://localhost"); // Base URL doesn't matter for path only
  loginUrl.searchParams.set("reason", "member-required");
  if (callbackUrl) {
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
  }

  redirect(loginUrl.pathname + loginUrl.search);
}
