import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../tenancy/tenantService";
import { getPublishedPublicPage } from "./publicPageService";
import { getClubTheme } from "./publicThemeService";
import { getPublicFooterData } from "./publicFooterService";
import { getServerViewerForClub, toViewerVisibilityContext } from "../auth/viewer";
import { getVisiblePublicNavigation, getVisiblePublicActions } from "./publicNavigation";

import { getPublicClubSettings } from "./publicClubSettingsService";

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
    const context = await resolveClubContext(clubSlug);
    const page = await getPublishedPublicPage(context.club.id, pageSlug);
    
    return {
      ...context,
      page,
    };
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }
    throw error;
  }
}

/**
 * Resolves the common context needed for themed club pages.
 */
export async function resolveClubContext(clubSlug: string) {
  try {
    const club = await requireClubBySlug(clubSlug);
    const serverViewer = await getServerViewerForClub(club.id);
    const viewer = toViewerVisibilityContext(serverViewer);
    
    const theme = await getClubTheme(club.id);
    const footerData = await getPublicFooterData(club.id);
    const navigationItems = getVisiblePublicNavigation(clubSlug, viewer);
    const actionItems = getVisiblePublicActions(clubSlug, viewer);
    const publicSettings = await getPublicClubSettings(club.id);

    return {
      club,
      theme: theme || undefined,
      footerData,
      navigationItems,
      actionItems,
      viewer,
      publicSettings,
    };
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }
    throw error;
  }
}
