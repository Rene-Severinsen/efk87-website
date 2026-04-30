# Admin Implementation

## Overview
The club admin area is located at `/[clubSlug]/admin`. It provides a dedicated workspace for club administrators and owners to manage club-specific data, members, and content.

## Route Structure
Admin routes are organized into several logical groups. Most routes currently exist as **protected stubs** to reserve the URL space and provide a consistent navigation experience while real functionality is being implemented.

### Overblik
- **Forside** (`/admin`): Main dashboard with KPI overview.
- **Handlinger i dag** (`/admin/handlinger-i-dag`): Tasks requiring immediate attention (stub).
- **Systemstatus** (`/admin/systemstatus`): Operational health and delivery status (stub).

### Klubdrift
- **Medlemmer** (`/admin/medlemmer`): Member overview with statistics and profile management.
- **Flyveskole** (`/admin/flyveskole`): School flying and instructor overview (stub).
- **Flyvemeldinger** (`/admin/flyvemeldinger`): Moderation of flight intents.
- **Mailinglister** (`/admin/mailinglister`): Mailing list configuration.

### Indhold
- **Forsideindhold** (`/admin/forside-indhold`): Manage announcements, messages, and signups on the club's homepage. Supports visibility periods, audience control (PUBLIC/MEMBERS_ONLY), and optional signups with quantity and notes.
- **Artikler** (`/admin/artikler`): News and article publishing. Supports rich text editing (BlockNote), server-side slug generation, and external image URL insertion. Articles are organized by tags; categories are not used. Reading time has been removed. Image upload is not implemented.
- **Forum** (`/admin/forum`): Forum category management. Allows admins to create, edit, and deactivate forum categories.
- **Galleri** (`/admin/galleri`): Photo gallery management (read-only foundation).
- **Kalender** (`/admin/kalender`): Admin-managed calendar and homepage marquee entries.

### Platform
- **Statistik** (`/admin/statistik`): Activity metrics and flight reports.
- **Eksport** (`/admin/eksport`): Secure data exports (stub).
- **Site settings** (`/admin/site-settings`): Club configuration, theme, and domain (stub).

## Access Control
Admin routes are protected by `requireClubAdminForClub` guard located in `src/lib/auth/adminAccessGuards.ts`.

### Rules:
- **Authenticated:** User must be logged in.
- **Active Membership:** User must have an `ACTIVE` status in their `ClubMembership` for the current club.
- **Admin/Owner Role:** User must have either `ADMIN` or `OWNER` role.
- **Redirection:** 
  - Anonymous users or non-admin members are redirected to `/[clubSlug]/login?reason=admin-required`.

## Visual Identity
The admin area uses a "Dark Premium Glass" theme:
- **Background:** Deep dark navy/black (`#060a12`).
- **Cards & Panels:** Semi-transparent glass panels with subtle borders and backdrop blur.
- **Typography:** High-contrast text (`#eef5ff`) with muted variants for secondary info.
- **Accents:** Vibrant blue for primary actions and success/warning colors for status badges.
- **Components:** Scoped under `.admin-*` CSS classes and using CSS variables for theme consistency.

## Components
Located in `src/components/admin/`:
- `AdminShell`: Layout wrapper with sidebar and topbar.
- `AdminDashboard`: Main dashboard view.
- `AdminSidebar`: Navigation menu.
- `AdminPlaceholderPage`: Consistent placeholder for unimplemented modules.
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

### Mailinglister (Mailing Lists)
- **Route**: `/[clubSlug]/admin/mailinglister`
- **Purpose**: Read-only overview of mailing list configuration.
- **Service**: `src/lib/mailingLists/clubMailingListService.ts`
- **Capabilities**: View all configured lists, see status, and track last update time.
- **Status**: Read-only. Editing is not yet implemented.

### Medlemshåndtering (Member Management)
- **Routes**: 
  - `/[clubSlug]/admin/medlemmer` (Overview)
  - `/[clubSlug]/admin/medlemmer/ny` (Create)
  - `/[clubSlug]/admin/medlemmer/[userId]/rediger` (Edit)
- **Purpose**: Manage member profiles, club roles, and certificates.
- **Services**: 
  - `src/lib/admin/memberAdminService.ts`
  - `src/lib/members/memberProfileService.ts`
  - `src/lib/members/memberNumberService.ts`
- **Actions**: 
  - `src/lib/admin/memberAdminActions.ts` (Update)
  - `src/lib/admin/memberCreateActions.ts` (Create)
- **Capabilities**: 
  - Statistics dashboard for member statuses and roles.
  - Comprehensive member list.
  - Member creation with automatic `memberNumber` assignment.
  - MDK nummer validation: Required for `SENIOR` and `JUNIOR` membership types during creation. Optional for `PASSIVE`.
  - Full profile editing (stamdata, contact info, membership type).
  - Medlemsnummer: Management of club-specific member numbers used as payment references. Unique per club. System-managed (read-only) once assigned.
  - Instructor status: Marking a member as "Instruktør" enables their public visibility on the club's instructor contact page.
  - Certificate management (normalized model).
  - Future billing: Reserved UI for pushing members to billing/Dinero.
- **Privacy**: All data is strictly tenant-scoped.

### Statistik (Statistics)
- **Route**: `/[clubSlug]/admin/statistik`
- **Purpose**: Overview of member activity and flight intents.
- **Service**: `src/lib/admin/adminStatisticsService.ts`
- **Capabilities**: View activity trend for the last 14 days, today's activity metrics, and annual flight intent summaries.
- **Privacy**: Real names are shown in the admin view.
- **Tenant Scoping**: All statistics are strictly scoped to the current club.

### Kalender (Calendar)
- **Route**: `/[clubSlug]/admin/kalender`
- **Purpose**: Manage club calendar entries ("Kalenderindslag").
- **Actions**: `src/lib/admin/calendarActions.ts`
- **Service**: `src/lib/admin/calendarAdminService.ts`
- **Capabilities**:
  - Full CRUD for calendar entries.
  - Set date, time, location, and rich description.
  - Control publication status.
  - "Force Show in Marquee" flag to override normal upcoming logic on the homepage.

### Forum Administration
- **Route**: `/[clubSlug]/admin/forum`
- **Purpose**: Manage forum categories.
- **Actions**: `src/lib/forum/actions/adminForumActions.ts`
- **Service**: `src/lib/forum/forumService.ts`
- **Capabilities**:
  - Full CRUD for forum categories (title, description, slug, sort order, active status).
  - **Notifikationsmail**: Admin-managed email address per category. If set, an email is sent to this address on every new thread and reply in the category.
  - List all categories with thread counts.
  - Quick links to view categories on the public site.

### Forsideindhold (Homepage Content)
- **Route**: `/[clubSlug]/admin/forside-indhold`
- **Purpose**: Manage announcements and signups on the homepage.
- **Actions**: `src/lib/homepageContent/homepageContentActions.ts`
- **Service**: `src/lib/homepageContent/homepageContentService.ts`
- **Capabilities**:
  - CRUD for homepage content blocks with Rich Text support.
  - Scheduling (visibleFrom/visibleUntil).
  - Visibility control (Public vs Members Only).
  - Signup management: NONE, ONE_PER_MEMBER, QUANTITY.
  - Participant management: View list of signups, and cancel signups as admin.
  - Sorting: Manual sort order control.

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
