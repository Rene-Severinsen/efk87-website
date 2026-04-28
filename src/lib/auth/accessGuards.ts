import { redirect } from "next/navigation";
import { getServerViewerForClub, ServerViewerContext } from "./viewer";

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
  clubSlug: string
): Promise<ServerViewerContext> {
  const viewer = await getServerViewerForClub(clubId);

  if (viewer.isMember) {
    return viewer;
  }

  // Not a member or not authenticated
  redirect(`/${clubSlug}/login?reason=member-required`);
}
