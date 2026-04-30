import prisma from "../db/prisma";
import { FlightSchoolBookingStatus, FlightSchoolSessionStatus, Prisma } from "../../generated/prisma";
import { startOfDay, endOfDay } from "date-fns";

/**
 * List all sessions for a club.
 */
export async function listSessions(clubId: string) {
  return prisma.flightSchoolSession.findMany({
    where: { clubId },
    include: {
      instructor: true,
      _count: {
        select: { timeSlots: true }
      }
    },
    orderBy: { date: 'desc' }
  });
}

/**
 * List published sessions for a specific date.
 */
export async function listPublishedSessionsForDate(clubId: string, date: Date) {
  return prisma.flightSchoolSession.findMany({
    where: {
      clubId,
      date: {
        gte: startOfDay(date),
        lte: endOfDay(date),
      },
      status: FlightSchoolSessionStatus.PUBLISHED,
    },
    include: {
      instructor: true,
      timeSlots: {
        where: { isActive: true },
        include: {
          bookings: {
            where: { status: FlightSchoolBookingStatus.BOOKED },
            include: {
              member: true
            }
          }
        },
        orderBy: { sortOrder: 'asc' }
      }
    }
  });
}

/**
 * Helper for today's active/published sessions for the homepage box.
 * Sourced from Point 33 of requirements.
 */
export async function getTodayPublishedSessions(clubId: string) {
  return listPublishedSessionsForDate(clubId, new Date());
}

/**
 * List all slots for a session with their booking state.
 */
export async function listSlotsWithBookingState(sessionId: string) {
  return prisma.flightSchoolTimeSlot.findMany({
    where: { flightSchoolSessionId: sessionId },
    include: {
      bookings: {
        include: {
          member: true
        }
      }
    },
    orderBy: { sortOrder: 'asc' }
  });
}

/**
 * Create a new flight school session.
 */
export async function createSession(data: {
  clubId: string;
  date: Date;
  startsAt?: Date | null;
  endsAt?: Date | null;
  instructorMemberProfileId: string;
  status?: FlightSchoolSessionStatus;
  note?: string | null;
}) {
  return prisma.flightSchoolSession.create({
    data: {
      date: data.date,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      instructorMemberProfileId: data.instructorMemberProfileId,
      status: data.status,
      note: data.note,
      clubId: data.clubId
    } as Prisma.FlightSchoolSessionUncheckedCreateInput
  });
}

/**
 * Update an existing session.
 */
export async function updateSession(id: string, data: Prisma.FlightSchoolSessionUncheckedUpdateInput) {
  return prisma.flightSchoolSession.update({
    where: { id },
    data
  });
}

/**
 * Cancel a session.
 */
export async function cancelSession(id: string) {
  return prisma.flightSchoolSession.update({
    where: { id },
    data: { status: FlightSchoolSessionStatus.CANCELLED }
  });
}

/**
 * Create a new time slot.
 * Includes overlap check for the instructor.
 */
export async function createTimeSlot(data: {
  clubId: string;
  flightSchoolSessionId: string;
  startsAt: Date;
  endsAt?: Date | null;
  capacity?: number;
  sortOrder?: number;
  isActive?: boolean;
}) {
  await checkInstructorOverlap(
    data.clubId,
    data.flightSchoolSessionId,
    new Date(data.startsAt),
    data.endsAt ? new Date(data.endsAt) : null
  );

  return prisma.flightSchoolTimeSlot.create({
    data: {
      flightSchoolSessionId: data.flightSchoolSessionId,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      capacity: data.capacity,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
      clubId: data.clubId
    } as Prisma.FlightSchoolTimeSlotUncheckedCreateInput
  });
}

/**
 * Update a time slot.
 * Includes overlap check for the instructor.
 */
export async function updateTimeSlot(id: string, data: Prisma.FlightSchoolTimeSlotUncheckedUpdateInput) {
  const existingSlot = await prisma.flightSchoolTimeSlot.findUniqueOrThrow({
    where: { id },
    include: { session: true }
  });

  const clubId = typeof data.clubId === 'string' ? data.clubId : existingSlot.clubId;
  const sessionId = typeof data.flightSchoolSessionId === 'string' ? data.flightSchoolSessionId : existingSlot.flightSchoolSessionId;

  // Helper to extract date from possible update operations or direct value
  const getDate = (val: unknown, fallback: Date | null): Date | null => {
    if (val === undefined) return fallback;
    if (val === null) return null;
    if (val instanceof Date) return val;
    if (typeof val === 'string') return new Date(val);
    if (typeof val === 'object' && val !== null && 'set' in val) {
      return getDate((val as { set: unknown }).set, fallback);
    }
    return fallback;
  };

  const startsAt = getDate(data.startsAt, existingSlot.startsAt) || existingSlot.startsAt;
  const endsAt = getDate(data.endsAt, existingSlot.endsAt);

  await checkInstructorOverlap(clubId, sessionId, startsAt, endsAt, id);

  return prisma.flightSchoolTimeSlot.update({
    where: { id },
    data
  });
}

/**
 * Cancel/deactivate a time slot.
 */
export async function cancelTimeSlot(id: string) {
  return prisma.flightSchoolTimeSlot.update({
    where: { id },
    data: { isActive: false }
  });
}

/**
 * Book a slot for a member.
 */
export async function bookSlot(clubId: string, memberProfileId: string, slotId: string) {
  // 1. Validate slot exists and is active
  const slot = await prisma.flightSchoolTimeSlot.findUniqueOrThrow({
    where: { id: slotId },
    include: {
      session: true,
      bookings: {
        where: { status: FlightSchoolBookingStatus.BOOKED }
      }
    }
  });

  if (!slot.isActive) {
    throw new Error("Time slot is not active");
  }

  // 2. Validate session is published (Requirement 22)
  if (slot.session.status !== FlightSchoolSessionStatus.PUBLISHED) {
    throw new Error("Only PUBLISHED sessions can be booked");
  }

  // 3. Validate capacity (Requirement 25)
  if (slot.bookings.length >= slot.capacity) {
    throw new Error("Time slot capacity reached");
  }

  // 4. Validate member not already booked for THIS slot (Requirement 26)
  const existingBooking = slot.bookings.find(b => b.memberProfileId === memberProfileId);
  if (existingBooking) {
    throw new Error("Member already booked for this slot");
  }

  // 5. Create booking
  const booking = await prisma.flightSchoolBooking.create({
    data: {
      clubId,
      flightSchoolTimeSlotId: slotId,
      memberProfileId,
      status: FlightSchoolBookingStatus.BOOKED
    }
  });

  // 31. TODO: Add notification service seam here for later instructor notification
  // Example: await notifyInstructorOfNewBooking(booking.id);

  return booking;
}

/**
 * Cancel a member's own booking (Requirement 30).
 */
export async function cancelOwnBooking(bookingId: string, memberProfileId: string) {
  const booking = await prisma.flightSchoolBooking.findUniqueOrThrow({
    where: { id: bookingId }
  });

  if (booking.memberProfileId !== memberProfileId) {
    throw new Error("Not authorized to cancel this booking");
  }

  const updatedBooking = await prisma.flightSchoolBooking.update({
    where: { id: bookingId },
    data: {
      status: FlightSchoolBookingStatus.CANCELLED,
      cancelledAt: new Date(),
      cancelledById: memberProfileId
    }
  });

  // 31. TODO: Add notification service seam here for later instructor notification
  // Example: await notifyInstructorOfBookingCancellation(booking.id);

  return updatedBooking;
}

/**
 * Helper to check if instructor has overlapping active slots (Requirement 28, 29).
 */
async function checkInstructorOverlap(
  clubId: string,
  sessionId: string,
  startsAt: Date,
  endsAt: Date | null,
  excludeSlotId?: string
) {
  const session = await prisma.flightSchoolSession.findUniqueOrThrow({
    where: { id: sessionId },
    select: { instructorMemberProfileId: true }
  });

  const instructorId = session.instructorMemberProfileId;

  // Simple overlap check: 
  // If we have an end date, we check for overlapping intervals.
  // If we don't have an end date, we check for slots that start at the same time 
  // or existing slots that would contain this start time.
  const overlappingSlots = await prisma.flightSchoolTimeSlot.findMany({
    where: {
      clubId,
      isActive: true,
      id: excludeSlotId ? { not: excludeSlotId } : undefined,
      session: {
        instructorMemberProfileId: instructorId,
        status: { not: FlightSchoolSessionStatus.CANCELLED }
      },
      OR: [
        {
          // Case 1: Standard overlap where both have endsAt
          // (StartA < EndB) AND (EndA > StartB)
          startsAt: { lt: endsAt || new Date(startsAt.getTime() + 1000) },
          endsAt: {
            not: null,
            gt: startsAt
          }
        },
        {
          // Case 2: Existing slot has no end
          startsAt: { lte: startsAt },
          endsAt: null
        }
      ]
    }
  });

  if (overlappingSlots.length > 0) {
    throw new Error("Instructor has overlapping active slots within this club");
  }
}
