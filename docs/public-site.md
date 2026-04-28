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
- **Homepage Info Cards**: `publicHomeInfoCardService.ts` handles fetching active info cards (side cards).
- **Branding & Theme**: `publicThemeService.ts` handles fetching tenant-scoped visual settings.
- **Flight Intents (“Jeg flyver”)**: `publicFlightIntentService.ts` handles fetching active social presence indicators.
- **Public Footer**: `publicFooterService.ts` handles fetching club footer description, contact info, and active sponsors.
- **Model Storage**: Currently uses the `PublicPage` model with the reserved slug `'home'`.
- **Feature Tile Model**: `PublicHomeFeatureTile` handles the four main call-to-action tiles.
  - Tenant-scoped by `clubId`.
  - Ordered by `sortOrder`.
  - Only `isActive` tiles are shown.
  - Image URLs are currently temporary placeholders.
  - **Visibility**: Supports `PUBLIC` and `MEMBERS_ONLY` visibility rules.
- **Homepage Info Card Model**: `PublicHomeInfoCard` handles lightweight homepage highlights (right-side hero cards).
  - Tenant-scoped by `clubId`.
  - Ordered by `sortOrder`.
  - Only `isActive` cards are shown publicly.
  - Supports up to 3 optional badges.
  - Currently seeded, but designed to be admin-manageable later.
  - Not an event or calendar record.
  - **Visibility**: Supports `PUBLIC` and `MEMBERS_ONLY` visibility rules.
- **Public Club Footer Model**: `PublicClubFooter` handles club-specific footer content.
  - Tenant-scoped by `clubId` (unique).
  - Includes description, address, email, phone, and CVR.
  - Currently seeded, but designed to be admin-manageable later.
  - **Visibility**: Currently remains `PUBLIC` for all visitors.
- **Public Sponsor Model**: `PublicSponsor` handles simple public labels/links.
  - Tenant-scoped by `clubId`.
  - Ordered by `sortOrder`.
  - Only `isActive` sponsors are shown.
  - Logo/media handling is not yet implemented.
  - Currently seeded, but designed to be admin-manageable later.
  - **Visibility**: Currently remains `PUBLIC` for all visitors.
- **Approved Design**: The homepage layout and design remain a locked visual reference.

## Visibility

The platform implements a visibility foundation to distinguish between public and member-only content.

- **Viewer Context**: Access is governed by `ViewerVisibilityContext` (anonymous, member, admin).
- **Public View**: The current public homepage renders as an anonymous visitor.
- **Rules**: `PUBLIC` content is seen by everyone; `MEMBERS_ONLY` requires authentication.
- **Implementation**: Services filter data based on visibility; routes provide the viewer context.

For more details, see [Visibility documentation](visibility.md).

## Visual Themes

Visual settings are managed per club through the `ClubTheme` model.

- **Tenant Scoped**: All theme values are scoped by `clubId`.
- **CSS Variables**: Theme values are applied to the public homepage as CSS variables on the root element.
- **Locked Visuals**: The approved EFK87 mockup remains the locked visual reference. Theme controls must not be used to redesign the layout.
- **Service**: `src/lib/publicSite/publicThemeService.ts` provides `getClubTheme(clubId)`.

## Data Management
- **Dynamic Content**: Hero title and subtitle are sourced from the `PublicPage` model via `publicHomePageService`.
- **Flight Intents**: "Jeg flyver" data is fetched via `publicFlightIntentService` and rendered on the homepage.
- **Footer & Sponsors**: Data is fetched via `publicFooterService` and rendered on the homepage footer.
- **Static Placeholders**: Content for forum activity and social highlights are currently static placeholders and will be modeled in future tasks.
- **"Jeg flyver" Domain**: This is a social presence feature, not a standard event model. See [Flight Intents documentation](flight-intents.md) for details.

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
