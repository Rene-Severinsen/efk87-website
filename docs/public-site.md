# Public Site Foundation

This document describes the foundation for the public-facing club websites within the platform.

## Navigation

Currently, the public club navigation is defined statically in `src/lib/publicSite/publicNavigation.ts`.

### Current Navigation Structure
- **Home**: `/{clubSlug}`
- **About**: `/{clubSlug}/about`
- **Events**: `/{clubSlug}/events`
- **Members**: `/{clubSlug}/members`

### Future Evolution
- Navigation must later become managed via CMS or Admin UI.
- The navigation structure will be persisted in the database (likely associated with `ClubSettings`).

## Components

### PublicClubShell
`src/components/publicSite/PublicClubShell.tsx` is the base layout component for all public-facing club pages.

- It accepts a `club` object and `children`.
- It renders the club's display name.
- It renders the navigation links generated from the tenant slug.
- It provides a consistent header and footer for the public site.

## Implementation Guidelines

- **No Hardcoding**: Public site components must not hardcode `EFK87` or any other specific club data. Use the data provided by the `club` object.
- **Tenant Resolution**: Public club pages must resolve the tenant via `tenantService` (specifically `requireClubBySlug` or `getClubBySlug`).
- **URL Generation**: All public site navigation URLs must be generated using the tenant slug to ensure they are correctly scoped to the current club.
- **Server Rendering**: Keep public site components server-rendered where possible to optimize for SEO and performance. Avoid client-side state unless strictly required.
