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
- **Homepage Visibility:** The public homepage currently shows today's list only. It filters for rows where:
    - `status` is `ACTIVE`
    - `visibility` is `PUBLIC`
    - `flightDate` is the current date
    - `expiresAt` is null or in the future
- **Retention:** Past rows remain stored for future statistics. Do not delete old rows.
- **Future intents:** Future-dated flight intents are supported at the data level but are not displayed on today's homepage.
- **Submit Flow (Future):** Future UI must support selecting today or a future date.

## Shared Service

All public flight intent queries must go through `src/lib/publicSite/publicFlightIntentService.ts`.
- `getTodayFlightIntents(clubId)`: Used for the daily presence list on the homepage.
- `getActiveFlightIntents(clubId)`: Returns all active intents, including future ones.

Direct Prisma queries in route pages are discouraged.

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
- [ ] Member submit flow (Requires Auth).
- [ ] Edit/Cancel flow.
- [ ] Automatic expiry logic.
- [ ] Notifications/Emails.
- [ ] Statistics UI/Graphs.
