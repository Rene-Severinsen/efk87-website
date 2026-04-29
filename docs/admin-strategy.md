# Club Admin Strategy

This document outlines the architecture and strategy for the club-level administration interface.

## Core Strategy

- **Tenant-Scoped**: Club administration is strictly scoped to a single club (tenant).
- **Route**: The admin interface should be located at `/[clubSlug]/admin`.
- **Isolation**: Platform administration (global settings, club creation) is a separate concern and not covered by this strategy.

## Admin Access Rules

Access to the `/[clubSlug]/admin` route must be strictly controlled:

1.  **Authentication**: The user must be authenticated.
2.  **Membership**: The user must have an **ACTIVE** `ClubMembership` for the current club.
3.  **Role**: The user must have a `ClubRole` of either `ADMIN` or `OWNER`.
4.  **Granularity**: `OWNER` role may later be granted additional destructive or high-level settings permissions beyond what a standard `ADMIN` can perform.

## Editable Public Site Surfaces

The following models and fields are defined as editable surfaces from the club admin:

### PublicHomePage
Dedicated homepage content model.
- `heroTitle`
- `heroSubtitle`
- `introTitle`
- `introBody`
- `primaryCtaLabel`
- `primaryCtaHref`
- `secondaryCtaLabel`
- `secondaryCtaHref`

### ClubTheme
Controls the visual branding of the club site.
- `backgroundColor`
- `panelColor`
- `panelSoftColor`
- `lineColor`
- `textColor`
- `mutedTextColor`
- `accentColor`
- `accentColor2`
- `shadowValue`
- `radiusValue`
- **Future**: `heroImageUrl`.

### PublicHomeFeatureTile
Tiles displayed on the homepage for key navigation.
- `title`
- `description`
- `href`
- `sortOrder`
- `isActive`
- `visibility` (PUBLIC or MEMBERS_ONLY)
- **Future**: `imageUrl`.

### PublicHomeInfoCard
Small information cards displayed in the hero sidebar.
- `title`
- `body`
- `badge1`, `badge2`, `badge3`
- `sortOrder`
- `isActive`
- `visibility` (PUBLIC or MEMBERS_ONLY)

### PublicPage
Generic tenant-scoped content pages.
Examples: `about`, `members`, `galleri`, `artikler`, `flyveskole`, `bliv-medlem`.
- `slug`
- `title`
- `excerpt`
- `body`
- `status` (DRAFT or PUBLISHED)

### PublicClubFooter
Club contact and identification information.
- `description`
- `addressLine1` & `addressLine2`
- `email`
- `phone`
- `cvr`

### PublicSponsor
Sponsors displayed in the footer.
- `name`
- `href`
- `sortOrder`
- `isActive`

## Future Admin Sections

The admin interface should be organized into the following sections:

- **Dashboard**: Overview of club activity and site status.
- **Homepage**: Editor for hero section and intro text.
- **Pages**: Management of generic public pages.
- **Navigation**: Management of header and footer navigation links.
- **Theme**: Visual branding and token management.
- **Footer & Sponsors**: Contact info and sponsor list.
- **Members**: Membership list and role management.
- **“Jeg flyver”**: Moderation and statistics for flight intents.
- **Simple Calendar**: Overview of upcoming planned activity (not a full event system).
- **Settings**: General club settings, mailing list configuration, and domain configuration.

## Mailing List Configuration

Future club settings should allow admins to configure the following mailing list addresses:

1.  **General Club Mailing List**: Used for general club announcements.
2.  **“Jeg flyver” Mailing List**: Used for activity intent notifications.

These addresses must be stored per tenant and must never be hardcoded in business logic.

## Implementation Rules

- **No Hardcoding**: The admin interface must never hardcode specific club identifiers (like `EFK87`). It must always operate on the `currentClubId` resolved from the route.
- **Visibility Rules**: Admin edits must respect and not bypass defined visibility rules (e.g., draft status, members-only visibility).
- **Service Reuse**: Admin forms should reuse shared services and server actions to avoid duplication of update logic.
- **Model Separation**: 
    - Homepage editor must use `PublicHomePage` service/model.
    - Generic page editor must use `PublicPage` service/model.
    - Do not mix homepage and generic pages in admin implementation.
- **Visual Design**: The approved homepage mockup remains the locked visual reference. Admin editing changes content, not layout.
- **Public Preview**: Future implementation should allow admins to preview the site as both an anonymous viewer and a logged-in member.
- **Theme Safety**: Theme editing is limited to safe token values (colors, shadows, radii). Layout redesign is not permitted via the theme editor.
- **Calendar Logic**: Describe the calendar as a "simple calendar/overview" rather than a complex "event system".
- **Out of Scope**: File/media uploads, full CMS editor implementation, emails, notifications, and complex analytics are future scope items.

131. **All admin routes are protected stubs by default**: Routes are reserved and protected before implementation to ensure a consistent UX.

## Recommended Implementation Sequence

1.  **Auth Provider**: Decide on and configure the authentication provider.
2.  **Session Resolution**: Implement viewer/session resolution logic.
3.  **Route Protection**: Protect the `/[clubSlug]/admin` route using middleware or layout-level checks.
4.  **Admin Shell**: Create the basic admin layout and navigation.
5.  **Route Stubs**: Implement all sidebar routes as protected stubs using `AdminPlaceholderPage`. (COMPLETED v1.1)
6.  **Read-only Dashboard**: Implement a dashboard showing current public site data in a read-only format. (COMPLETED v1 foundation)
7.  **Homepage Editor**: Add the ability to edit the homepage hero and intro content.
8.  **Theme Editor**: Implement the theme token editor.
9.  **Surface Editors**: Implement editors for feature tiles, info cards, pages, and footer/sponsors.
10. **Moderation**: Add members management and "Jeg flyver" moderation/statistics. (In progress: Flight Intents completed)
