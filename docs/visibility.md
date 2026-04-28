# Visibility

This document outlines the visibility rules for content on the platform.

## Foundation

The platform supports both public views (anonymous visitors) and logged-in member views. 
Visibility is controlled via the `PublicSurfaceVisibility` enum (and `ClubFlightIntentVisibility` for flight intents).

### Visibility Rules

- **PUBLIC**: Content is visible to everyone, including anonymous visitors.
- **MEMBERS_ONLY**: Content is only visible to authenticated users who are either members of the club or administrators.

### Viewer Context

Access to content is governed by the `ViewerVisibilityContext`:

```typescript
export type ViewerVisibilityContext = {
  isAuthenticated: boolean;
  isMember: boolean;
  isAdmin: boolean;
};
```

An `anonymousViewer` constant is provided for public routes:

```typescript
export const anonymousViewer: ViewerVisibilityContext = {
  isAuthenticated: false,
  isMember: false,
  isAdmin: false,
};
```

### Navigation and Actions

Public navigation and topbar actions support visibility rules. This ensures that only relevant links and buttons are shown to anonymous visitors versus authenticated members.

- **Centralized Definition**: Navigation items and actions are defined in `src/lib/publicSite/publicNavigation.ts`.
- **Visibility Aware**: Each item has a `visibility` property (`PUBLIC` or `MEMBERS_ONLY`).
- **Filtering**: Items are filtered using `getVisiblePublicNavigation` and `getVisiblePublicActions` which utilize the `canViewSurface` helper.
- **Anonymous View**: The public homepage uses `anonymousViewer`, so only `PUBLIC` items like "Bliv medlem" and "Log ind" are visible, while "Min profil" and "Forum" are hidden until authentication is implemented.

### Member-only Area Placeholders

The following routes are reserved for future member-only functionality:

- `/[clubSlug]/profil`: Future "Min profil" page.
- `/[clubSlug]/forum`: Future member forum.
- `/[clubSlug]/jeg-flyver`: Future flight registration for members.

These routes currently exist as **placeholders only**. Authentication is not yet implemented, and these routes are explicitly intended to be restricted to members in the future. In the current phase, they are hidden from anonymous navigation but accessible via direct URL for structural verification.

## Implementation

### Services

Services that fetch homepage content (feature tiles, info cards, flight intents) must accept a `ViewerVisibilityContext` and filter the results accordingly.

Example:
```typescript
export async function getActiveHomeFeatureTiles(clubId: string, viewer: ViewerVisibilityContext) {
  const allowedVisibilities = ["PUBLIC"];
  if (viewer.isAuthenticated && (viewer.isMember || viewer.isAdmin)) {
    allowedVisibilities.push("MEMBERS_ONLY");
  }

  return prisma.publicHomeFeatureTile.findMany({
    where: {
      clubId,
      isActive: true,
      visibility: { in: allowedVisibilities },
    },
    // ...
  });
}
```

### Homepage

The main homepage route (`src/app/[clubSlug]/page.tsx`) resolves the `ViewerVisibilityContext` server-side from the Auth.js session and the club-specific `ClubMembership`.

This ensures that:
- Anonymous visitors see only `PUBLIC` content.
- Authenticated users without membership in the current club see only `PUBLIC` content.
- Authenticated members with `ACTIVE` status see `MEMBERS_ONLY` content.
- Authenticated admins/owners with `ACTIVE` status see `MEMBERS_ONLY` content.

The resolution is handled by `getServerViewerForClub(clubId)` and converted via `toViewerVisibilityContext(serverViewer)`.

## Domain Specifics

### Flight Intents

Flight intents already support visibility. 
- "Jeg flyver" submission is intended to be `MEMBERS_ONLY` in the future.
- The public homepage display may show limited public activity depending on the visibility of individual intents.

### Footer and Sponsors

Currently, the club footer and sponsors remain `PUBLIC` for all visitors and do not yet support granular visibility settings.
