# Public Site Foundation

This document describes the foundation for the public-facing club websites within the platform.

## Navigation

Currently, the public club navigation is defined statically in `src/lib/publicSite/publicNavigation.ts`.

### Current Navigation Structure (Visibility Aware)
- **Forside**: `/{clubSlug}` (PUBLIC)
- **Forum**: `/{clubSlug}/forum` (MEMBERS_ONLY)
- **Galleri**: `/{clubSlug}/galleri` (PUBLIC)
- **Artikler**: `/{clubSlug}/artikler` (PUBLIC)
- **Flyveskole**: `/{clubSlug}/flyveskole` (PUBLIC)
- **Om [Club]**: `/{clubSlug}/about` (PUBLIC)
- **Kontakt**: `/{clubSlug}/om/kontakt` (PUBLIC)

### Current Topbar Actions (Visibility Aware)
- **Min profil**: `/{clubSlug}/profil` (MEMBERS_ONLY)
- **Bliv medlem**: `/{clubSlug}/bliv-medlem` (PUBLIC)
- **Log ind**: `/{clubSlug}/login` (PUBLIC)

### Member-only Areas
- **Min profil**: `/{clubSlug}/profil` (MEMBERS_ONLY) - Protected member profile page based on the approved mockup.
- **Forum**: `/{clubSlug}/forum` (MEMBERS_ONLY) - Placeholder only.
- **Jeg flyver**: `/{clubSlug}/jeg-flyver` (MEMBERS_ONLY)
- **Jeg flyver liste**: `/{clubSlug}/jeg-flyver/liste` (PUBLIC)

These routes are reserved for future member-only functionality. Currently, they render a placeholder title and text stating that login and access control are not yet implemented. They are hidden from navigation for anonymous viewers.

### Future Evolution
- Navigation must later become managed via CMS or Admin UI.
- The navigation structure will be persisted in the database (likely associated with `ClubSettings`).
- "Jeg flyver" submit flow must later support both today and future flight dates.
- Authentication and session handling will be integrated to protect member-only areas.
- No event or calendar model is introduced for these placeholders.

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
- **New Member Highlight**: `newMemberHighlightService.ts` handles fetching members who joined within the last 14 days.
  - Tenant-scoped by `clubId`.
  - Filtered by `joinedAt` date (within last 14 days).
  - Excludes members with status `RESIGNED`.
  - Shows only display name and joined date.
  - Maximum 5 members are shown.
  - Triggers a split-layout hero on the homepage when visible.
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
- **Member Activity**: "Senest online" preview is fetched via `src/lib/memberActivity/memberActivityService.ts` and shows a compact list of today's active members, scoped to the current club.
- **Static Placeholders**: Content for forum activity and social highlights are currently static placeholders and will be modeled in future tasks.
- **"Jeg flyver" Domain**: This is a social presence feature, not a standard event model. See [Flight Intents documentation](flight-intents.md) for details.

### Approved Design Master
The homepage (`PublicClubHomePage.tsx`) is the approved visual master. All non-home pages must follow the same dark premium club-platform theme using the shared themed shell.

## Responsive Design
All public and member-facing pages are built to be responsive-first.

- **Breakpoints**: 768px (Mobile) and 1100px (Tablet).
- **Mobile Menu**: `ThemedTopBar` provides a mobile-optimized navigation menu.
- **Rules**: No horizontal overflow at 375px width, touch-friendly targets (44px), and readable font sizes.
- **Documentation**: See [Responsive Design Guidelines](responsive-design.md) for details.

## Homepage V2

Frontpage V2 is now the active live homepage for all clubs.

- **Component**: `src/components/publicSite/homeV2/PublicClubHomePageV2.tsx`
- **CSS**: `src/components/publicSite/homeV2/PublicClubHomePageV2.css` (Scoped with `.home-v2-` prefix)
- **Status**: Live. 
- **Active Route**: `/[clubSlug]`
- **Preview Route**: `/[clubSlug]/preview/home-v2` (Remains available during transition)
- **Fallback**: The old homepage component (`PublicClubHomePage.tsx`) remains in the codebase temporarily as a fallback/reference.
- **Guidelines**:
  - v2 uses real data for club, user profile, and "Jeg flyver" activity.
  - v2 includes a "Nye medlemmer" highlight card that appears when members have joined within the last 14 days.
  - v2 uses the `ClubCalendarEntry` model to populate the homepage marquee (ticker).
  - Chat, statistics, and gallery remain static placeholders.
  - v2 CSS is scoped and non-invasive.

## Components

### PublicClubHomePage
`src/components/publicSite/PublicClubHomePage.tsx` implements the approved mockup structure and style for the homepage. It uses `PublicClubHomePage.css` for scoped styling.

### ThemedClubPageShell
`src/components/publicSite/ThemedClubPageShell.tsx` is the shared layout for all non-home club pages.

- **Visual Consistency**: Uses the same dark premium visual language as the homepage.
- **Theme Support**: Applies `ClubTheme` CSS variables consistently across the site.
- **Navigation**: Uses the approved `ThemedTopBar` with visibility-aware navigation and actions.
- **Footer**: Uses the approved `ThemedFooter` with club contact info and sponsors.
- **Content Area**: Provides a centered content area (default max-width 1000px) with a themed header.

### ThemedBuildingBlocks
Reusable small themed components for consistent internal page styling:
- **ThemedPageHeader**: Standard title and optional subtitle/eyebrow.
- **ThemedSectionCard**: A card container matching the homepage "section-card" style.
- **ThemedCard**: Standard card container matching the homepage "card" style.

### PublicClubShell (Deprecated)
`src/components/publicSite/PublicClubShell.tsx` is the old white/default layout and is deprecated. All pages should use `ThemedClubPageShell`.

### PublicContentPage (Deprecated)
`src/components/publicSite/PublicContentPage.tsx` is deprecated in favor of `ThemedClubPageShell` and `ThemedSectionCard`.

## Implementation Guidelines

- **No Hardcoding**: Public site components must not hardcode `EFK87` or any other specific club data. Use the data provided by the `club` object.
- **Tenant Resolution**: Public club pages must resolve the tenant via `tenantService` (specifically `requireClubBySlug` or `getClubBySlug`). All pages MUST use `tenantService`.
- **Route Logic**: Duplicated route logic should be avoided by using the shared helper `src/lib/publicSite/publicPageRoute.ts`. 
- **Public Pages**: All public pages must use `tenantService` and `publicPageService`.
- **URL Generation**: All public site navigation URLs must be generated using the tenant slug to ensure they are correctly scoped to the current club.
- **Server Rendering**: Keep public site components server-rendered where possible to optimize for SEO and performance. Avoid client-side state unless strictly required.
- **Route List**:
  - `/[clubSlug]`: Forside (Home)
  - `/[clubSlug]/about`: Om klubben (PublicPage content)
  - `/[clubSlug]/om/kontakt`: Kontakt (Instructor contact page)
  - `/[clubSlug]/galleri`: Galleri (PublicPage content stub)
  - `/[clubSlug]/artikler`: Artikler (PublicPage content stub)
  - `/[clubSlug]/flyveskole`: Flyveskole (PublicPage content stub)
  - `/[clubSlug]/bliv-medlem`: Bliv medlem (PublicPage content stub)
  - `/[clubSlug]/jeg-flyver/liste`: Jeg flyver (Full today list)
  - `/[clubSlug]/login`: Log ind (Placeholder only, no auth implementation)
  - `/[clubSlug]/kalender/[entryId]`: Kalenderindslag (Public detail page)

### Public Route Details
- **Content Stubs**: Galleri, Artikler, Flyveskole, and Bliv medlem use the `PublicPage` model via `publicPageService`. They currently contain seed content for EFK87 and serve as visual/structural stubs.
- **Login Placeholder**: The login page is a visual placeholder only. It does not implement real authentication, session handling, or form fields. A code comment indicates that auth/session handling is intentionally skipped in this scope.
- **Member-only Areas**: Forum (`/[clubSlug]/forum`) and My Profile (`/[clubSlug]/profil`) are intended for members only and are hidden from anonymous visitors in the navigation.
- **Scope Limitations**:
  - Gallery is now implemented as a read-only foundation with tenant-scoping.
  - Calendar and marquee logic are implemented.
  - Forum backend is not implemented.
  - No CMS editor or Admin UI for managing these pages yet.
- **Content Management**: Real content for these pages will later be CMS/admin-managed where relevant.
