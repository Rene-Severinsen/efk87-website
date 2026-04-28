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
- `plannedAt`: Optional expected time of arrival.
- `expiresAt`: Optional time for automatic expiry logic.
- `cancelledAt`: Timestamp if the intent was cancelled.
- `createdAt` / `updatedAt`: Standard timestamps.

## Shared Service

All public flight intent queries must go through `src/lib/publicSite/publicFlightIntentService.ts`.
Direct Prisma queries in route pages are discouraged.

## Analytics & Statistics

The model is prepared for future statistics and analytics:
- **Activity volume:** Count by day, week, or month using `createdAt`.
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
