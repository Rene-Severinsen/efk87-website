# Admin Implementation

## Overview
The club admin area is located at `/[clubSlug]/admin`. It provides a dedicated workspace for club administrators and owners to manage club-specific data, members, and content.

## Access Control
Admin routes are protected by `requireClubAdminForClub` guard located in `src/lib/auth/adminAccessGuards.ts`.

### Rules:
- **Authenticated:** User must be logged in.
- **Active Membership:** User must have an `ACTIVE` status in their `ClubMembership` for the current club.
- **Admin/Owner Role:** User must have either `ADMIN` or `OWNER` role.
- **Redirection:** 
  - Anonymous users or non-admin members are redirected to `/[clubSlug]/login?reason=admin-required`.

## Visual Identity
The admin area uses a distinct visual theme compared to the public/member site:
- **Sidebar:** Dark navy fixed sidebar (`#001529`).
- **Workspace:** Light grey background (`#f4f7f9`) with white operational cards.
- **Typography:** Standard system sans-serif for a clean, operational feel.
- **Components:** Scoped under `.admin-*` CSS classes to avoid global style leakage.

## Components
Located in `src/components/admin/`:
- `AdminShell`: Layout wrapper with sidebar and topbar.
- `AdminDashboard`: Main dashboard view.
- `AdminSidebar`: Navigation menu.
- `AdminStatistik`: Statistics dashboard foundation.
- `AdminHero`: Welcome section.
- `AdminMetricGrid`: KPI cards (currently placeholders).
- `AdminActionTable`: Pending tasks/actions (currently placeholders).
- `AdminActivityStream`: Recent system activity (currently placeholders).
- `AdminQuickLinks`: Shortcuts to common tasks.

## Admin Features

### Flyvemeldinger (Flight Intents)
- **Route**: `/[clubSlug]/admin/flyvemeldinger`
- **Purpose**: Moderation of member flight intents.
- **Service**: `src/lib/admin/flightIntentAdminService.ts`
- **Actions**: `src/lib/admin/cancelFlightIntentAsAdminAction.ts`
- **Capabilities**: View today's active/cancelled intents, view recent history, and cancel active intents.

### Statistik (Statistics)
- **Route**: `/[clubSlug]/admin/statistik`
- **Purpose**: Overview of member activity and flight intents.
- **Service**: `src/lib/admin/adminStatisticsService.ts`
- **Capabilities**: View activity trend for the last 14 days, today's activity metrics, and annual flight intent summaries.
- **Privacy**: Real names are shown in the admin view.
- **Tenant Scoping**: All statistics are strictly scoped to the current club.

## Formatting Rules
Admin views follow standardized formatting for consistency:

- **Full timestamps**: `dd.mm.yyyy tt:mm:ss` (e.g., `29.04.2026 11:07:00`).
- **Date only**: `dd.mm.yyyy` (e.g., `29.04.2026`).
- **Time only**: `tt:mm:ss` where the date is shown separately.
- **Utility**: All admin pages must use `src/lib/format/adminDateFormat.ts`.
- **Empty values**: Display as `-`.

## Development Seed
A test admin user is provided for local development:
- **Email:** `admin@efk87.local`
- **Password:** (Managed by auth provider, typically any password in dev)
- **Role:** `ADMIN`
- **Status:** `ACTIVE`

This user is only seeded when `APP_ENV=development`.
