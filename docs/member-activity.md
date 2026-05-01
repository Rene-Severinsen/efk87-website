# Member Activity

This document describes the member activity tracking and display features.

## Senest online (Latest Online)

"Senest online" is a compact social presence feature shown on the homepage. It provides a non-real-time preview of which members have been active recently, scoped to the current club.

### Core Concepts
- **Definition**: Shows the latest members seen today for the current club.
- **Real Data Only**: "Senest online" uses real activity data only. Seed or mock members are never shown.
- **Empty State**: If no members have been active today, a clean empty state is shown: “Ingen medlemmer online lige nu”.
- **Tenant Scoping**: Activity is tracked per club using `MemberDailyActivity`. A user can have separate activity records for different clubs they are members of.
- **Not Real-time**: It is not a live websocket-based presence system. It relies on the last recorded activity for the current club today.
- **Privacy**:
  - **Anonymous Viewers**: See masked names (e.g., "Medlem") to protect member privacy.
  - **Logged-in Members/Admins**: Can see the real names of the active members.
- **Data Retention**: Each record represents one user's activity for one club on one specific day.

### Implementation
- **Data Model**: Uses `MemberDailyActivity` model (unique per `clubId`, `userId`, and `activityDate`).
- **Service**: `src/lib/memberActivity/memberActivityService.ts` handles recording and fetching stats.
- **Tracking**: Recorded via `recordMemberActivityForClub` when a member visits the club homepage.
- **Homepage Widget**:
  - Integrated into the `PublicClubHomePageV2` stat row.
  - Displays a compact list of up to 5 members active today in the current club.
  - Shows the time (`HH:mm`) and name (masked if anonymous).
  - Footer shows the total count of unique members active today in the club.

### Visual Constraints
- **Compactness**: Designed to fit within the existing stat card footprint without increasing card height.
- **Typography**: Uses tight line-height and small font sizes for the list items.
- **Badge**: Displays an "I dag" (Today) badge instead of "Live".

## Data Management
- `MemberDailyActivity` is tenant-scoped by `clubId`.
- One row per user per club per day.
- `User.lastSeenAt` is not used for this feature (it was removed to support multi-tenancy).
- Anonymous names are masked; only members/admins see real names.
- No detailed pageview analytics or admin graphs are implemented for this feature.
- **Admin Statistics**: First version uses `MemberDailyActivity` to show active members today and trends over the last 14 days in the admin panel. Not real-time.
