# Mailing Lists foundation

Mailing lists are tenant-scoped and configurable per club. They define the targets for various notifications and announcements.

## Purpose

The `ClubMailingList` model allows club administrators to configure where emails should be sent for different types of activity.

- **GENERAL**: General club announcements and newsletters.
- **FLIGHT_INTENT**: Notifications when members register "Jeg flyver" (flight intents).
- **SCHOOL**: Communication related to the flight school.
- **TRIP**: Coordination for club trips and events.
- **OTHER**: Catch-all for other specific needs.

## Schema

> [!WARNING]
> While `ClubMailingList` stores configuration, it **does not guarantee deliverability**. All sending must comply with the requirements in [Mail Delivery Discovery](./mail-delivery-discovery.md).

Mailing lists are stored in the `ClubMailingList` model:

- `clubId`: Scoped to a specific club.
- `key`: A unique identifier within the club (e.g., "general", "flight-intents").
- `purpose`: One of the `ClubMailingListPurpose` enum values.
- `emailAddress`: The target address for the list.
- `isActive`: Whether the list is currently in use.

## Service Layer

Use `src/lib/mailingLists/clubMailingListService.ts` to interact with mailing list configurations:

- `getActiveClubMailingLists(clubId)`
- `getAdminClubMailingLists(clubId)` (for admin overview)
- `getClubMailingListByPurpose(clubId, purpose)`
- `getFlightIntentMailingListForClub(clubId)`

## Admin Interface

Club admins can view the mailing list configuration at `/[clubSlug]/admin/mailinglister`.

The interface provides:
- Overview of all configured lists (active and inactive).
- Key metrics (active/inactive counts).
- Status and purpose badges.
- Warning about mail delivery status.

Note: Editing and manual synchronization are not yet implemented.

## EFK87 Default Setup

During initial seeding, EFK87 is configured with:

1. **General list**: `key: "general"`, `purpose: GENERAL`, `emailAddress: efk87@efk87.dk`
2. **"Jeg flyver" list**: `key: "flight-intents"`, `purpose: FLIGHT_INTENT`, `emailAddress: website@efk87.dk`

## Future Admin Implementation

Club admins can view these lists through the admin interface. Editing and deletion is not yet implemented. Missing configuration must not block business logic (e.g., creating a flight intent should succeed even if no mailing list is configured).
