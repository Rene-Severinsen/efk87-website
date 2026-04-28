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

### Multitenancy

- All public content is scoped by `clubId`.
- A unique constraint exists on `(clubId, slug)` to ensure slugs are unique within a club but can be reused across different clubs.

## Content Services

- **Generic Public Pages**: `publicPageService.ts` is used for generic public pages (e.g., about, members).
  - `getPublishedPublicPage(clubId, slug)`: Returns only `PUBLISHED` pages.
- **Homepage**: `publicHomePageService.ts` is used exclusively for the club homepage.
  - `getPublicHomePage(clubId)`: Returns the published homepage record.

## Implementation Details

- **Structural Separation**: The homepage is structurally separate from generic pages.
- **No Querying Prisma Directly from Routes**: Routes must use services to fetch content.
- **Fallbacks**: Routes keep a fallback placeholder if no published page exists in the database.
- **Admin UI**: Not implemented yet. Initial content is provided via database seeds.

## Initial Data

Initial content for EFK87 is provided in `prisma/seed.ts`:
- `about`: About EFK87 page.
- `members`: Members information page.
