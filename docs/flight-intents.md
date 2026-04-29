# Flight Intents (“Jeg flyver”) Foundation

This document describes the foundation for club presence and activity intent, known as “Jeg flyver” (I’m flying).

## Overview

`ClubFlightIntent` is a tenant-scoped model that represents a member's intention to visit the club or airfield. It is not an event model but a short-lived presence indicator.

## Model Structure

The `ClubFlightIntent` model includes:
- `id`: Unique identifier (CUID).
- `clubId`: Tenant scoping.
- `displayName`: Temporary name field (until full auth/member relation exists).
- `message`: Optional status message.
- `activityType`: Enum (FLYING, MAINTENANCE, WEATHER_DEPENDENT, TRAINING, SOCIAL, OTHER).
- `status`: Enum (ACTIVE, CANCELLED, EXPIRED).
- `source`: Enum (MANUAL, ADMIN_SEED, FUTURE_MEMBER_APP).
- `visibility`: Enum (PUBLIC, MEMBERS_ONLY).
- `flightDate`: The intended flying date (normalized to start-of-day).
- `plannedAt`: Optional expected time of activity on that day.
- `expiresAt`: Optional time for automatic expiry logic.
- `cancelledAt`: Timestamp if the intent was cancelled.
- `createdAt` / `updatedAt`: Standard timestamps.

## Daily Presence List Logic

“Jeg flyver” is a daily presence list.

- **Intended Date:** `flightDate` represents the calendar day the member intends to be active. 
- **Timezone:** Timezone handling must respect `Europe/Copenhagen`.
- **Homepage Visibility**: The public homepage shows latest 5 today entries only, respecting visibility. 
- **Full List Route**: A full public read-only list for today is available at `/[clubSlug]/jeg-flyver/liste`.
- **Title/Subtitle**: The full list page has the title “Jeg flyver” and subtitle “Her kan du se dagens flyvemeldinger.”.
- **Empty State**: Displays “Der er endnu ingen flyvemeldinger for i dag.” if no entries exist.
    - For anonymous visitors, it only shows rows where `visibility` is `PUBLIC`.
    - It also filters for `status` is `ACTIVE`, `flightDate` is the current date, and `expiresAt` is null or in the future.
- **Retention:** Past rows remain stored for future statistics. Do not delete old rows.
- **Future intents:** Future-dated flight intents are supported at the data level but are not displayed on today's homepage.
- **Submit Flow (Future):** "Jeg flyver" submission will be a `MEMBERS_ONLY` action. Future UI must support selecting today or a future date.

## Shared Services

### Public Access
All public flight intent queries must go through `src/lib/publicSite/publicFlightIntentService.ts`.
- `getTodayFlightIntents(clubId, viewer)`: Used for the daily presence list on the homepage, respecting visibility. Limited to 5 rows. Masked for anonymous visitors.
- `getTodayFlightIntentList(clubId, viewer)`: Used for the full daily list page. Returns all today's PUBLIC ACTIVE rows without limit. Masked for anonymous visitors.
- `getActiveFlightIntents(clubId, viewer)`: Returns all active intents, including future ones, respecting visibility. Limited to 5 rows. Masked for anonymous visitors.

### Member Access
All member-specific flight intent queries must go through `src/lib/flightIntents/memberFlightIntentService.ts`.
- `getMemberRecentFlightIntents(clubId, viewer)`: Returns the member's own recent flight intents (limit 10), ordered by `flightDate` and `createdAt` descending.
- **Ownership Identity Strategy**: Ownership is determined by the `userId` relation on `ClubFlightIntent`, linking the intent to the member who created it.

Direct Prisma queries in route pages are discouraged.

## Visibility & Privacy

- **Foundation**: `ClubFlightIntent` uses the `ClubFlightIntentVisibility` enum.
- **PUBLIC**: Visible to everyone (anonymous visitors).
- **MEMBERS_ONLY**: Visible only to logged-in members or admins.
- **Anonymous Masking**: For anonymous visitors, `displayName` is masked as “Medlem” in public views. This protects member privacy while keeping club activity visible. Stored data is unchanged.
- **Member Access**: Logged-in active members and admins can see real display names.
- **Anonymous Route**: The current homepage route uses `anonymousViewer` and only exposes `PUBLIC` intents.

For more details on visibility, see [Visibility documentation](visibility.md).

## Analytics & Statistics

The model is prepared for future statistics and analytics:
- **Activity volume:** Count by day, week, or month using `flightDate`.
- **Attendance patterns:** Statistics on `plannedAt` to see peak attendance times.
- **Categorization:** Distribution of `activityType` (e.g., how much is social vs. flying).
- **Engagement:** Later count by member when user relations are added.
- **Reliability:** Cancellation and expiry statistics using `cancelledAt` and `status`.
- **Seasonality:** Long-term activity patterns.

Note: Login and member activity analytics must be handled by a separate activity/audit model in the future, not mixed into `ClubFlightIntent`.

## Implementation Status

- [x] Foundation model and enums.
- [x] Shared service for public access.
- [x] Homepage rendering from real data.
- [x] Idempotent seed data for EFK87 demo.
- [x] Member submit foundation (authenticated ACTIVE member).
- [x] Member cancellation flow.
- [ ] Edit flow.
- [ ] Automatic expiry logic.
- [ ] Notifications/Emails (See Strategy below).
- [ ] Statistics UI/Graphs.

## Notifications Strategy

Future scope includes sending automated email notifications when a new flight intent is created.

### Target Mailing List
- Notifications must be sent to the **Dedicated “Jeg flyver” Mailing List** configured for the club.
- The mailing list address must be tenant-scoped and configurable via club settings.

### Notification Flow
1.  **Submission**: Member submits the "Jeg flyver" form.
2.  **Storage**: The `ClubFlightIntent` is saved to the database.
3.  **Notification Trigger**: An asynchronous process (or a post-save hook) triggers the email notification.
4.  **Content**: The email should include the member's display name, intended date/time, activity type, and optional message.
5.  **Environment Safety**: Actual emails are only sent in `production` or when `canSendExternalNotifications` is true.

### UI Feedback
- The submission form may include a note informing the member that a message will be sent to the configured mailing list upon submission.

## Member Submission & Overview

Submission of new flight intents requires an authenticated **ACTIVE** `ClubMembership`.

- **Route**: `/[clubSlug]/jeg-flyver`
- **Rules**:
  - `flightDate` must be today or in the future. Past dates are rejected.
  - `plannedTime` is optional and combined with `flightDate` into `plannedAt`.
  - `activityType` is required.
  - `message` is optional (max 240 chars).
  - Rows are created with `status: ACTIVE`, `source: FUTURE_MEMBER_APP`, and `visibility: PUBLIC` (for now).
  - `displayName` is derived from the user's name or email.
  - `expiresAt` is set to the end of the `flightDate`.
- **Overview**: The member page shows their own recent (up to 10) flight intents below the form.
- **Edit Flow**: Not yet implemented. Future scope.
- **Cancellation**: Members can cancel their own ACTIVE flight intents. Cancellation sets `status` to `CANCELLED` and `cancelledAt` to the current time. Cancelled rows are hidden from public views but remain in the member's own recent list for reference and future statistics.
- **Retention**: Data is retained for future statistics even after expiry.
- **Analytics**: The model supports future analytics for activity volume, categorization, and engagement.
