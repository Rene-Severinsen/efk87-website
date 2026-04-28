import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../tenancy/tenantService";
import { getPublishedPublicPage } from "./publicPageService";

/**
 * Shared helper to resolve both the club and a specific public page.
 * Uses tenantService and publicPageService to ensure consistent resolution.
 * 
 * @param clubSlug The club's URL slug
 * @param pageSlug The public page's URL slug (e.g., 'about', 'members')
 * @returns Object containing club and page data
 * @throws notFound() if the club is not found
 */
export async function resolvePublicPageForClub(clubSlug: string, pageSlug: string) {
  try {
    const club = await requireClubBySlug(clubSlug);
    const page = await getPublishedPublicPage(club.id, pageSlug);
    
    return {
      club,
      page,
    };
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }
    throw error;
  }
}
