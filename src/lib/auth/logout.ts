"use server";

import { signOut } from "../../auth";

/**
 * Server action to handle user logout.
 * Redirects to the club home page after signing out.
 */
export async function logoutAction(clubSlug: string) {
  await signOut({ redirectTo: `/${clubSlug}` });
}
