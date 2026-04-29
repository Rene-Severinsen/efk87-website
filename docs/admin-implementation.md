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

## Development Seed
A test admin user is provided for local development:
- **Email:** `admin@efk87.local`
- **Password:** (Managed by auth provider, typically any password in dev)
- **Role:** `ADMIN`
- **Status:** `ACTIVE`

This user is only seeded when `APP_ENV=development`.
