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

The main homepage route (`src/app/[clubSlug]/page.tsx`) currently uses the `anonymousViewer`. 
This ensures that only `PUBLIC` content is rendered for the general public.

Future authentication integration will resolve the `ViewerVisibilityContext` from the user session.

## Domain Specifics

### Flight Intents

Flight intents already support visibility. 
- "Jeg flyver" submission is intended to be `MEMBERS_ONLY` in the future.
- The public homepage display may show limited public activity depending on the visibility of individual intents.

### Footer and Sponsors

Currently, the club footer and sponsors remain `PUBLIC` for all visitors and do not yet support granular visibility settings.
