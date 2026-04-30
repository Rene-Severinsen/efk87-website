# Flight School Booking Foundation

This document describes the foundation for the flight school booking system.

## Public Booking System

The public booking system allows club members to view the school calendar and book flight times.

### Public Route
- `/[clubSlug]/flyveskole/skolekalender`: The main page for the school calendar.
- Linked from the flyveskole landing page with the text: "Se skolekalender og book tid".

### Access Rules
- **Guests**: Can view the calendar but cannot book or cancel. They see a prompt to log in.
- **Members**: Can book available slots and cancel their own bookings.
- **Non-members/Logged-out users**: Cannot book.

### Booking & Cancellation Rules
- Only `PUBLISHED` sessions from today and forward are shown.
- `CANCELLED` sessions or sessions in `DRAFT` status are not visible to the public.
- Members can only book active slots (`isActive: true`).
- A member cannot book a slot that is already booked by another member (one student per slot).
- Members can only cancel their own active bookings.
- After cancellation, the slot becomes available for others immediately.

### Instructor Notification Seam
- A TODO/service seam has been added in `src/lib/flightSchool/flightSchoolActions.ts` for later implementation of instructor notifications upon successful booking.

## Data Model

The booking system is built around three main models, all of which are tenant-scoped by `clubId`:

### FlightSchoolSession
Represents a planned flight school session by an instructor.
- A session belongs to one instructor (`ClubMemberProfile`).
- A session is linked to a specific date.
- Multiple instructors can have sessions on the same date.
- Statuses: `DRAFT`, `PUBLISHED`, `CANCELLED`. Only `PUBLISHED` sessions can be booked.

### FlightSchoolTimeSlot
Represents individual time slots within a session.
- A session can have multiple time slots.
- Slots have a start time and an optional end time.
- Slots have a capacity (default 1).
- Overlapping slots are allowed across different instructors.
- **The same instructor cannot have overlapping active slots within the same club.** This is enforced in the service layer.

### FlightSchoolBooking
Represents a booking made by a student for a specific time slot.
- A student books one specific time slot with one specific instructor.
- Statuses: `BOOKED`, `CANCELLED`.
- A member cannot book the same slot twice.

## Booking & Cancellation Rules

1. Only `PUBLISHED` sessions can be booked.
2. `CANCELLED` sessions cannot be booked.
3. Only active slots (`isActive: true`) can be booked.
4. Slot capacity must be respected.
5. Member can only cancel their own booking (unless admin context is added later).
6. Instructor overlap is checked when creating or updating time slots.

## Notification System

A seam for instructor notifications has been prepared in the service layer (`TODO` items). Actual implementation of email/push notifications is planned for a later phase.

## Homepage Integration

The `getTodayPublishedSessions` helper in `flightSchoolBookingService.ts` is provided for future integration with the homepage "Skoleflyvning i dag" box.

## Admin Maintenance Flow

The flight school booking system is managed via **Admin → Flyveskole → Skolekalender**.

### Managing Sessions
- Admins can create new sessions for any active club member marked as an instructor (`isInstructor: true`).
- A session must have a date, start/end time, and instructor.
- Use the **Status** field to control visibility:
  - `DRAFT`: Visible only to admins.
  - `PUBLISHED`: Visible to students for booking (when public pages are implemented).
  - `CANCELLED`: Session is cancelled, bookings are preserved but inactive.

### Managing Time Slots
- Once a session is saved, click **Rediger** and then **Tilføj tid** to add slots.
- Each slot defines a specific interval (e.g., 09:00 - 10:00) and capacity.
- **Overlap Protection**: The system prevents an instructor from having overlapping active slots across all their sessions in the club.
- **Deactivating Slots**: If a slot has bookings, it should be deactivated (`isActive: false`) rather than deleted to preserve history.

### Viewing Bookings
- In the **Skolekalender** list, click the expand icon (chevron) to see all time slots and the students booked for each slot.
- Booking status and member names are displayed read-only in this iteration.
