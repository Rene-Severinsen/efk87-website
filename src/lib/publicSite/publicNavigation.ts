import { PublicSurfaceVisibility } from "../../generated/prisma";
import { canViewSurface, ViewerVisibilityContext } from "./publicVisibility";
import { publicRoutes } from "../publicRoutes";

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
      href: publicRoutes.home(clubSlug),
      key: 'home',
      visibility: 'PUBLIC',
    },
    {
      label: 'Forum',
      href: publicRoutes.forum(clubSlug),
      key: 'forum',
      visibility: 'PUBLIC',
    },
    {
      label: 'Galleri',
      href: publicRoutes.gallery(clubSlug),
      key: 'gallery',
      visibility: 'PUBLIC',
    },
    {
      label: 'Artikler',
      href: publicRoutes.articles(clubSlug),
      key: 'articles',
      visibility: 'PUBLIC',
    },
    {
      label: 'Flyveskole',
      href: publicRoutes.flightSchool(clubSlug),
      key: 'flyveskole',
      visibility: 'PUBLIC',
    },
    {
      label: `Om ${clubSlug.toUpperCase()}`,
      href: publicRoutes.about(clubSlug),
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
  const allActions: PublicNavigationItem[] = [];

  if (viewer.isAuthenticated) {
    if (viewer.isAdmin) {
      allActions.push({
        label: 'Admin',
        href: `/${clubSlug}/admin`,
        key: 'admin',
        visibility: 'MEMBERS_ONLY',
      });
    }

    if (viewer.isMember || viewer.isAdmin) {
      allActions.push({
        label: 'Min profil',
        href: publicRoutes.profile(clubSlug),
        key: 'profile',
        visibility: 'MEMBERS_ONLY',
      });
    } else {
      allActions.push({
        label: 'Bliv medlem',
        href: publicRoutes.becomeMember(clubSlug),
        key: 'join',
        visibility: 'PUBLIC',
        isPrimary: true,
      });
    }

    allActions.push({
      label: 'Log ud',
      href: publicRoutes.logout(clubSlug), // Handled via form action in UI
      key: 'logout',
      visibility: 'PUBLIC',
    });
  } else {
    allActions.push({
      label: 'Bliv medlem',
      href: publicRoutes.becomeMember(clubSlug),
      key: 'join',
      visibility: 'PUBLIC',
      isPrimary: true,
    });

    allActions.push({
      label: 'Log ind',
      href: publicRoutes.login(clubSlug),
      key: 'login',
      visibility: 'PUBLIC',
    });
  }

  return allActions;
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
      href: publicRoutes.home(clubSlug),
      key: 'home',
      visibility: 'PUBLIC',
    },
    {
      label: 'About',
      href: publicRoutes.about(clubSlug),
      key: 'about',
      visibility: 'PUBLIC',
    },
    {
      label: 'Events',
      href: publicRoutes.events(clubSlug),
      key: 'events',
      visibility: 'PUBLIC',
    },
    {
      label: 'Members',
      href: publicRoutes.members(clubSlug),
      key: 'members',
      visibility: 'MEMBERS_ONLY',
    },
  ];
}
