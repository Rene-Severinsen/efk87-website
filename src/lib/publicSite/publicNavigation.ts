/**
 * Typed navigation item structure for the public site.
 */
export interface PublicNavigationItem {
  label: string;
  href: string;
  key: string;
  isPrimary?: boolean;
}

/**
 * Generates the initial static navigation items for a club.
 * 
 * NOTE: This is temporary static configuration.
 * In the future, this should be managed via CMS or Admin UI.
 * 
 * @param clubSlug The tenant slug used to generate URLs
 * @returns Array of navigation items
 */
export function getPublicNavigation(clubSlug: string): PublicNavigationItem[] {
  return [
    {
      label: 'Home',
      href: `/${clubSlug}`,
      key: 'home',
    },
    {
      label: 'About',
      href: `/${clubSlug}/about`,
      key: 'about',
    },
    {
      label: 'Events',
      href: `/${clubSlug}/events`,
      key: 'events',
    },
    {
      label: 'Members',
      href: `/${clubSlug}/members`,
      key: 'members',
    },
  ];
}
