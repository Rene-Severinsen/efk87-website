import { PublicSurfaceVisibility } from "../../generated/prisma";
import { canViewSurface, ViewerVisibilityContext } from "./publicVisibility";

/**
 * Typed navigation item structure for the public site.
 */
export interface PublicNavigationItem {
  label: string;
  href: string;
  key: string;
  visibility: PublicSurfaceVisibility;
  isPrimary?: boolean;
}

/**
 * Generates the visible navigation items for a club based on the viewer.
 * 
 * @param clubSlug The tenant slug used to generate URLs
 * @param viewer The current viewer context
 * @returns Array of visible navigation items
 */
export function getVisiblePublicNavigation(
  clubSlug: string,
  viewer: ViewerVisibilityContext
): PublicNavigationItem[] {
  const allItems: PublicNavigationItem[] = [
    {
      label: 'Forside',
      href: `/${clubSlug}`,
      key: 'home',
      visibility: 'PUBLIC',
    },
    {
      label: 'Forum',
      href: `/${clubSlug}/forum`,
      key: 'forum',
      visibility: 'MEMBERS_ONLY',
    },
    {
      label: 'Galleri',
      href: `/${clubSlug}/galleri`,
      key: 'gallery',
      visibility: 'PUBLIC',
    },
    {
      label: 'Artikler',
      href: `/${clubSlug}/artikler`,
      key: 'articles',
      visibility: 'PUBLIC',
    },
    {
      label: 'Flyveskole',
      href: `/${clubSlug}/flyveskole`,
      key: 'flyveskole',
      visibility: 'PUBLIC',
    },
    {
      label: `Om ${clubSlug.toUpperCase()}`,
      href: `/${clubSlug}/about`,
      key: 'about',
      visibility: 'PUBLIC',
    },
  ];

  return allItems.filter(item => canViewSurface(item.visibility, viewer));
}

/**
 * Generates the visible topbar actions for a club based on the viewer.
 * 
 * @param clubSlug The tenant slug used to generate URLs
 * @param viewer The current viewer context
 * @returns Array of visible action items
 */
export function getVisiblePublicActions(
  clubSlug: string,
  viewer: ViewerVisibilityContext
): PublicNavigationItem[] {
  const allActions: PublicNavigationItem[] = [
    {
      label: 'Min profil',
      href: `/${clubSlug}/profil`,
      key: 'profile',
      visibility: 'MEMBERS_ONLY',
    },
    {
      label: 'Bliv medlem',
      href: `/${clubSlug}/bliv-medlem`,
      key: 'join',
      visibility: 'PUBLIC',
      isPrimary: true,
    },
    {
      label: 'Log ind',
      href: `/${clubSlug}/login`,
      key: 'login',
      visibility: 'PUBLIC',
    },
  ];

  return allActions.filter(item => canViewSurface(item.visibility, viewer));
}

/**
 * Generates the initial static navigation items for a club.
 * 
 * @deprecated Use getVisiblePublicNavigation instead.
 * @param clubSlug The tenant slug used to generate URLs
 * @returns Array of navigation items
 */
export function getPublicNavigation(clubSlug: string): PublicNavigationItem[] {
  return [
    {
      label: 'Home',
      href: `/${clubSlug}`,
      key: 'home',
      visibility: 'PUBLIC',
    },
    {
      label: 'About',
      href: `/${clubSlug}/about`,
      key: 'about',
      visibility: 'PUBLIC',
    },
    {
      label: 'Events',
      href: `/${clubSlug}/events`,
      key: 'events',
      visibility: 'PUBLIC',
    },
    {
      label: 'Members',
      href: `/${clubSlug}/members`,
      key: 'members',
      visibility: 'MEMBERS_ONLY',
    },
  ];
}
