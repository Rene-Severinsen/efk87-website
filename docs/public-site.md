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

## Homepage Design

The homepage design is based on the approved EFK87 visual mockup. It features a modern, card-based layout with high structural fidelity to the reference design.

### Visual Reference
- The approved HTML/CSS mockup is considered the locked visual reference for the homepage.
- Implementation preserves section order: Sticky Topbar, Hero Grid, Tile Grid, Activity Layout, and Footer.

### Theme Tokens
Theme values are defined as CSS variables in `PublicClubHomePage.css` to allow for future admin-managed customization:
- `--club-bg`: #0b1220
- `--club-panel`: rgba(18, 27, 46, 0.86)
- `--club-panel-soft`: rgba(255,255,255,0.035)
- `--club-line`: rgba(255,255,255,0.08)
- `--club-text`: #edf2ff
- `--club-muted`: #aab7d4
- `--club-accent`: #6ee7b7
- `--club-accent-2`: #7dd3fc
- `--club-radius`: 22px

### Data Management
- **Dynamic Content**: Hero title and subtitle are sourced from the `PublicPage` model (slug: 'home').
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
