# Member Activity

This document describes the member activity tracking and display features.

## Senest online (Latest Online)

"Senest online" is a compact social presence feature shown on the homepage. It provides a non-real-time preview of which members have been active recently.

### Core Concepts
- **Definition**: Shows the latest members seen today based on their `lastSeenAt` timestamp.
- **Not Real-time**: It is not a live websocket-based presence system. It relies on the last recorded activity of the user.
- **Privacy**:
  - **Anonymous Viewers**: See masked names (e.g., "Medlem") to protect member privacy.
  - **Logged-in Members/Admins**: Can see the real names of the active members.

### Implementation
- **Data Model**: Uses the `lastSeenAt` field on the `User` model.
- **Service**: `memberActivityService.ts` handles fetching the required stats.
- **Homepage Widget**:
  - Integrated into the `PublicClubHomePageV2` stat row.
  - Displays a compact list of up to 5 members active today.
  - Shows the time (`HH:mm`) and name (masked if anonymous).
  - Footer shows the total count of unique members active today.

### Visual Constraints
- **Compactness**: Designed to fit within the existing stat card footprint without increasing card height.
- **Typography**: Uses tight line-height and small font sizes for the list items.
- **Badge**: Displays an "I dag" (Today) badge instead of "Live".

## Data Management
- Activity is tracked by updating the `lastSeenAt` field when a user interacts with the platform (implementation details for the update trigger may vary by auth provider).
- The homepage preview is limited to max 5 members to maintain the compact layout.
