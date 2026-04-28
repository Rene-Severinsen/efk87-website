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

## Homepage Content

The homepage content is structurally separate from generic public pages.

- **Dedicated Service**: `publicHomePageService.ts` handles fetching the homepage record.
- **Feature Tiles**: `publicHomeFeatureTileService.ts` handles fetching active feature tiles.
- **Branding & Theme**: `publicThemeService.ts` handles fetching tenant-scoped visual settings.
- **Model Storage**: Currently uses the `PublicPage` model with the reserved slug `'home'`.
- **Feature Tile Model**: `PublicHomeFeatureTile` handles the four main call-to-action tiles.
  - Tenant-scoped by `clubId`.
  - Ordered by `sortOrder`.
  - Only `isActive` tiles are shown.
  - Image URLs are currently temporary placeholders.
- **Approved Design**: The homepage layout and design remain a locked visual reference.

## Visual Themes

Visual settings are managed per club through the `ClubTheme` model.

- **Tenant Scoped**: All theme values are scoped by `clubId`.
- **CSS Variables**: Theme values are applied to the public homepage as CSS variables on the root element.
- **Locked Visuals**: The approved EFK87 mockup remains the locked visual reference. Theme controls must not be used to redesign the layout.
- **Service**: `src/lib/publicSite/publicThemeService.ts` provides `getClubTheme(clubId)`.

## Data Management
- **Dynamic Content**: Hero title and subtitle are sourced from the `PublicPage` model via `publicHomePageService`.
- **Static Placeholders**: Content for "Jeg flyver", forum activity, social highlights, and sponsors are currently static placeholders and will be modeled in future tasks.
- **"Jeg flyver"**: This is a future social presence feature, not a standard event model.

## Components

### PublicClubHomePage
`src/components/publicSite/PublicClubHomePage.tsx` implements the approved mockup structure and style. It uses `PublicClubHomePage.css` for scoped styling.

### PublicClubShell
`src/components/publicSite/PublicClubShell.tsx` is the base layout component for other public-facing club pages.

- It accepts a `club` object and `children`.
- It renders the club's display name.
- It renders the navigation links generated from the tenant slug.
- It provides a consistent header and footer for the public site.

## Implementation Guidelines

- **No Hardcoding**: Public site components must not hardcode `EFK87` or any other specific club data. Use the data provided by the `club` object.
- **Tenant Resolution**: Public club pages must resolve the tenant via `tenantService` (specifically `requireClubBySlug` or `getClubBySlug`). All pages MUST use `tenantService`.
- **URL Generation**: All public site navigation URLs must be generated using the tenant slug to ensure they are correctly scoped to the current club.
- **Server Rendering**: Keep public site components server-rendered where possible to optimize for SEO and performance. Avoid client-side state unless strictly required.
- **Route List**:
  - `/[clubSlug]`: Home
  - `/[clubSlug]/about`: About
  - `/[clubSlug]/events`: Events
  - `/[clubSlug]/members`: Members (Placeholder, not authenticated/protected yet)
- **Content Management**: Real content for these pages will later be CMS/admin-managed where relevant.
