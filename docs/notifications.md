# Notifications & Mailing Lists

This document describes the strategy for club-scoped mailing lists and automated notifications.

## Mailing List Strategy

Clubs may have configured mailing lists for different purposes. These must be tenant-scoped and configurable per club.

### Core Mailing Lists

The platform identifies at least two primary mailing list concepts required by clubs like EFK87:

1.  **General Club Mailing List**: Used for general announcements, newsletters, and official club communications.
2.  **Dedicated “Jeg flyver” Mailing List**: A high-frequency list specifically for activity intents and coordination.

### Configuration

- Mailing list addresses and details are stored in the `ClubMailingList` model.
- Addresses must not be hardcoded in the business logic (e.g., no `EFK87` specific addresses in code).
- Future admin UI will allow authorized club admins to configure these addresses.
- See [Mailing Lists](./mailing-lists.md) for technical implementation details.

## Notification Strategy

Notifications (like those triggered by "Jeg flyver") should follow a decoupled and reliable delivery pattern.

### Principles

- **Non-blocking**: The primary action (e.g., creating a flight intent) must not be blocked by notification delivery.
- **Reliability**: Notification attempts and results should be logged.
- **Idempotency**: Avoid sending duplicate notifications for the same event.
- **Environment Safety**: Respect environment-specific safety rules to prevent accidental emails from non-production environments.

### Future Implementation Flow

> [!IMPORTANT]
> **"Jeg flyver" notification sending remains blocked** until the [Mail Delivery Discovery](./mail-delivery-discovery.md) is complete and DNS/provider permissions are confirmed.

1.  **Persistence**: Store the primary entity (e.g., `ClubFlightIntent`) first.
2.  **Trigger**: Emit an event or call a notification service after successful creation.
3.  **Queue/Async**: Enqueue the notification for asynchronous processing or send it immediately if the performance impact is negligible and it's wrapped in error handling.
4.  **Logging**: Record the attempt, timestamp, and result (success/failure).
5.  **Retries**: Support retry logic for transient failures (e.g., SMTP downtime) later.

## Environment Safety

Notification sending must respect the following environment safety rules (as defined in [Environment Configuration](environments.md)):

- **development**: No real emails must be sent.
- **qa**: No real member emails should be sent unless explicitly enabled via safe test configurations.
- **production**: Emails are only sent with approved and validated mail configurations.

The `env.canSendExternalNotifications` helper should be used to gate actual sending logic.
