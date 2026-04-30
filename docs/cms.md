# CMS Foundation

This document describes the public CMS content model and its implementation.

## Data Model

### PublicPage

The `PublicPage` model represents content pages that are visible to the public. Each page is scoped to a specific `Club` (tenant).

- `id`: Unique identifier (CUID).
- `clubId`: Reference to the `Club`.
- `slug`: URL slug for the page (unique per club).
- `title`: Page title.
- `excerpt`: Optional short summary.
- `body`: Main content of the page.
- `status`: `DRAFT` or `PUBLISHED`.
- `createdAt` / `updatedAt`: Standard timestamps.

### Flight School CMS

The Flight School CMS is a tenant-scoped foundation for managing flyveskole-related content.

- **FlightSchoolPage**: A single root page for the flight school per club. Contains a title, intro, and HTML content.
- **FlightSchoolDocument**: Individual readable CMS content pages (not PDF uploads). These are treated as rich text pages suitable for web rendering and print.
- **Tenant Scope**: Both models are strictly scoped to a `Club` via `clubId`.
- **Slugs**: `FlightSchoolDocument` uses slugs for URL resolution (e.g., `/[clubSlug]/flyveskole/[documentSlug]`).
- **Ordering**: Documents support a `sortOrder` for manual sequencing.
- **Content**: Content is stored as clean rich text (HTML) suitable for both web and print.

### Multitenancy

- All public content is scoped by `clubId`.
- A unique constraint exists on `(clubId, slug)` to ensure slugs are unique within a club but can be reused across different clubs.

## Content Services

- **Generic Public Pages**: `publicPageService.ts` is used for generic public pages (e.g., about, members).
  - `getPublishedPublicPage(clubId, slug)`: Returns only `PUBLISHED` pages.
- **Homepage**: `publicHomePageService.ts` is used exclusively for the club homepage.
  - `getPublicHomePage(clubId)`: Returns the published homepage record.
- **Footer Content**: `publicFooterService.ts` is used for club-specific footer and sponsor data.
  - `getPublicFooterData(clubId)`: Returns footer content and active sponsors.

## Implementation Details

- **Structural Separation**: The homepage is structurally separate from generic pages.
- **No Querying Prisma Directly from Routes**: Routes must use services to fetch content.
- **Fallbacks**: Routes keep a fallback placeholder if no published page exists in the database.
- **Admin UI**: Not implemented yet. Initial content is provided via database seeds.

## Initial Data

Initial content for EFK87 is provided in `prisma/seed.ts`:
- `about`: About EFK87 page.
- `members`: Members information page.
