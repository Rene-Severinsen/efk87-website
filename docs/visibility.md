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
- **Filtering**: Items are filtered using `getVisiblePublicNavigation` and `getVisiblePublicActions`.

#### Topbar Action Behavior

| State | Bliv medlem | Log ind | Min profil | Log ud |
|-------|-------------|---------|------------|--------|
| **Anonymous** | Visible | Visible | Hidden | Hidden |
| **Active Member / Admin** | Hidden | Hidden | Visible | Visible |
| **Authenticated Non-member** | Visible | Hidden | Hidden | Visible |

- **Log ud**: Logout is handled via an Auth.js `signOut` server action.
- **Bliv medlem**: Hidden for active members to avoid confusion.
- **Min profil**: Only visible to active members and admins.

### Member-only Area Placeholders

The following routes are reserved for member-only functionality:

- `/[clubSlug]/profil`: Member profile page.
- `/[clubSlug]/forum`: Member forum.
- `/[clubSlug]/jeg-flyver`: Flight registration for members.

These routes are protected by server-side viewer resolution. Anonymous visitors or authenticated users who are not active members of the current club are redirected to the login placeholder page (`/[clubSlug]/login?reason=member-required`).

Real login providers and the "Jeg flyver" submission flow are still future scope.

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

Flight intents support both visibility and privacy masking.
- **Visibility**: Intents can be `PUBLIC` or `MEMBERS_ONLY`.
- **Privacy Masking**: For anonymous visitors, `displayName` is masked as “Medlem” in public views. Logged-in active members and admins can see real display names.
- **Submit Flow**: "Jeg flyver" submission is intended to be `MEMBERS_ONLY` in the future.

### Footer and Sponsors

Currently, the club footer and sponsors remain `PUBLIC` for all visitors and do not yet support granular visibility settings.

<!-- BEGIN:docs-sync-2026-05-04-om-media-gallery:gallery-visibility -->

## Gallery Visibility

Gallery albums use PublicSurfaceVisibility.

Rules:

- PUBLIC: visible to anonymous visitors and members.
- MEMBERS_ONLY: visible only to logged-in members/admins of the club.

Members choose visibility when creating a gallery.

Member-created galleries are published immediately. There is no approval/pending-review state.

Admin can archive galleries. Archived galleries are hidden from public/member views but retained in admin as soft-deleted records.

<!-- END:docs-sync-2026-05-04-om-media-gallery:gallery-visibility -->

