import prisma from "../db/prisma";
import { FlightSchoolBookingStatus, FlightSchoolSessionStatus, Prisma } from "../../generated/prisma";
import { startOfDay, endOfDay } from "date-fns";

export type FlightSchoolCalendarBookingStatus = "FREE" | "BOOKED_BY_ME" | "OCCUPIED" | "INACTIVE";

export interface FlightSchoolCalendarSlotView {
  id: string;
  startsAt: Date;
  endsAt: Date | null;
  isActive: boolean;
  status: FlightSchoolCalendarBookingStatus;
  bookingId?: string;
  bookedMemberName?: string;
}

export interface FlightSchoolCalendarSessionView {
  id: string;
  date: Date;
  startsAt: Date | null;
  endsAt: Date | null;
  note: string | null;
  instructor: {
    firstName: string | null;
    lastName: string | null;
  };
  timeSlots: FlightSchoolCalendarSlotView[];
}

export interface FlightSchoolHomepageViewModel {
  hasSessionsToday: boolean;
  totalSessions: number;
  totalInstructors: number;
  totalBookedStudents: number;
  totalAvailableSlots: number;
  sessions: {
    id: string;
    instructorName: string;
    startTime: Date | null;
    endTime: Date | null;
    bookedSlots: number;
    totalActiveSlots: number;
  }[];
  upcomingDays: {
    date: Date;
    instructorCount: number;
    availableSlots: number;
  }[];
}

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
 * Get the view model for the homepage flight school box.
 */
export async function getFlightSchoolHomepageView(clubId: string): Promise<FlightSchoolHomepageViewModel> {
  const sessions = await getTodayPublishedSessions(clubId);

  let totalBookedStudents = 0;
  let totalAvailableSlots = 0;

  const sessionSummaries = sessions.map(session => {
    let sessionBooked = 0;
    let sessionActive = 0;

    session.timeSlots.forEach(slot => {
      sessionActive++;
      if (slot.bookings.length > 0) {
        sessionBooked++;
      }
    });

    totalBookedStudents += sessionBooked;
    totalAvailableSlots += (sessionActive - sessionBooked);

    return {
      id: session.id,
      instructorId: session.instructorMemberProfileId,
      instructorName: `${session.instructor.firstName} ${session.instructor.lastName}`.trim(),
      startTime: session.startsAt,
      endTime: session.endsAt,
      bookedSlots: sessionBooked,
      totalActiveSlots: sessionActive,
    };
  });

  const totalSessions = sessions.length;
  const instructors = new Set(sessions.map(s => s.instructorMemberProfileId));
  const totalInstructors = instructors.size;

  // Fetch upcoming days (published sessions after today)
  const today = startOfDay(new Date());
  const upcomingSessions = await prisma.flightSchoolSession.findMany({
    where: {
      clubId,
      date: {
        gt: endOfDay(today),
      },
      status: FlightSchoolSessionStatus.PUBLISHED,
    },
    include: {
      timeSlots: {
        where: { isActive: true },
        include: {
          bookings: {
            where: { status: FlightSchoolBookingStatus.BOOKED },
          }
        }
      }
    },
    orderBy: { date: 'asc' },
    take: 20, // Take a reasonable amount to find 2 unique dates
  });

  const upcomingDaysMap = new Map<string, { date: Date; instructorCount: number; availableSlots: number }>();
  
  for (const session of upcomingSessions) {
    const dateKey = startOfDay(session.date).toISOString();
    let dayData = upcomingDaysMap.get(dateKey);
    
    if (!dayData) {
      if (upcomingDaysMap.size >= 2) continue;
      dayData = {
        date: session.date,
        instructorCount: 0,
        availableSlots: 0,
      };
      upcomingDaysMap.set(dateKey, dayData);
    }

    dayData.instructorCount++;
    const activeSlots = session.timeSlots.length;
    const bookedSlots = session.timeSlots.reduce((acc, slot) => acc + slot.bookings.length, 0);
    dayData.availableSlots += (activeSlots - bookedSlots);
  }

  const upcomingDays = Array.from(upcomingDaysMap.values());

  return {
    hasSessionsToday: totalSessions > 0,
    totalSessions,
    totalInstructors,
    totalBookedStudents,
    totalAvailableSlots,
    sessions: sessionSummaries,
    upcomingDays,
  };
}

/**
 * List all published sessions from today and forward.
 * Grouped by date in the UI later.
 */
export async function listPublishedSessionsFromToday(clubId: string) {
  const today = startOfDay(new Date());
  
  return prisma.flightSchoolSession.findMany({
    where: {
      clubId,
      date: {
        gte: today,
      },
      status: FlightSchoolSessionStatus.PUBLISHED,
    },
    include: {
      instructor: true,
      timeSlots: {
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
    },
    orderBy: [
      { date: 'asc' },
      { startsAt: 'asc' }
    ]
  });
}

/**
 * List all published sessions from today and forward, mapped to view models.
 */
export async function listPublishedSessionsFromTodayView(
  clubId: string, 
  currentMemberProfileId?: string | null
): Promise<FlightSchoolCalendarSessionView[]> {
  const sessions = await listPublishedSessionsFromToday(clubId);

  return sessions.map((session) => ({
    id: session.id,
    date: session.date,
    startsAt: session.startsAt,
    endsAt: session.endsAt,
    note: session.note,
    instructor: {
      firstName: session.instructor.firstName,
      lastName: session.instructor.lastName,
    },
    timeSlots: session.timeSlots.map((slot) => {
      const activeBooking = slot.bookings[0];
      
      let status: FlightSchoolCalendarBookingStatus = "FREE";
      let bookedMemberName: string | undefined = undefined;

      if (!slot.isActive) {
        status = "INACTIVE";
      } else if (activeBooking) {
        if (currentMemberProfileId && activeBooking.memberProfileId === currentMemberProfileId) {
          status = "BOOKED_BY_ME";
        } else {
          status = "OCCUPIED";
          // Only expose booked member name if the viewer is a club member
          if (currentMemberProfileId && activeBooking.member) {
            bookedMemberName = `${activeBooking.member.firstName} ${activeBooking.member.lastName}`.trim();
          }
        }
      }

      return {
        id: slot.id,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        isActive: slot.isActive,
        status,
        bookingId: status === "BOOKED_BY_ME" ? activeBooking?.id : undefined,
        bookedMemberName,
      };
    }),
  }));
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
  await checkInstructorSessionConflict({
    clubId: data.clubId,
    date: data.date,
    instructorId: data.instructorMemberProfileId,
    status: data.status,
  });

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
  const existing = await prisma.flightSchoolSession.findUniqueOrThrow({
    where: { id },
  });

  const clubId = (data.clubId as string) || existing.clubId;
  const date = (data.date as Date) || existing.date;
  const instructorId = (data.instructorMemberProfileId as string) || existing.instructorMemberProfileId;
  const status = (data.status as FlightSchoolSessionStatus) || existing.status;

  await checkInstructorSessionConflict({
    clubId,
    date,
    instructorId,
    excludeSessionId: id,
    status,
  });

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
 * Deletes or cancels a flight school session based on whether it has bookings.
 */
export async function deleteOrCancelFlightSchoolSession(clubId: string, sessionId: string) {
  // 1. Validate session belongs to the club and get its booking count
  const session = await prisma.flightSchoolSession.findUnique({
    where: { id: sessionId, clubId },
    include: {
      timeSlots: {
        include: {
          bookings: {
            where: { status: "BOOKED" },
          },
        },
      },
    },
  });

  if (!session) {
    throw new Error("Session not found or access denied");
  }

  const activeBookings = session.timeSlots.flatMap((slot) => slot.bookings);
  const hasBookings = activeBookings.length > 0;

  if (!hasBookings) {
    // 2. No bookings: hard delete the session and its slots
    // Prisma handles the deletion of slots via onDelete: Cascade if configured, 
    // but based on the schema it doesn't seem to have Cascade for timeSlots on session deletion (it only has it on ArticleTagAssignment).
    // Let's check schema again. 
    // Actually, FlightSchoolTimeSlot has: session FlightSchoolSession @relation(fields: [flightSchoolSessionId], references: [id])
    // No onDelete: Cascade there. So we must delete slots manually if we want to be safe and avoid orphans or FK errors.
    
    return await prisma.$transaction(async (tx) => {
      // Delete slots first to avoid FK constraints
      await tx.flightSchoolTimeSlot.deleteMany({
        where: { flightSchoolSessionId: sessionId },
      });

      return await tx.flightSchoolSession.delete({
        where: { id: sessionId },
      });
    });
  } else {
    // 3. Has bookings: set status to CANCELLED and deactivate slots/bookings
    return await prisma.$transaction(async (tx) => {
      // Set session status to CANCELLED
      await tx.flightSchoolSession.update({
        where: { id: sessionId },
        data: { status: "CANCELLED" },
      });

      // Deactivate all underlying slots
      await tx.flightSchoolTimeSlot.updateMany({
        where: { flightSchoolSessionId: sessionId },
        data: { isActive: false },
      });

      // Mark active bookings as CANCELLED
      // FLIGHT_SCHOOL_SESSION_CANCELLED: Seam for email sending to activeBookings.
      // Booked students must receive cancellation email when real mail integration is implemented.
      // Use the generic mail service in src/lib/email/mailService.ts.
      // Do not hardcode email body here; consider adding a template concept under an appropriate admin/settings area later.
      const slotIds = (await tx.flightSchoolTimeSlot.findMany({
        where: { flightSchoolSessionId: sessionId },
        select: { id: true }
      })).map(s => s.id);

      await tx.flightSchoolBooking.updateMany({
        where: {
          flightSchoolTimeSlotId: { in: slotIds },
          status: "BOOKED",
        },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      });

      return { cancelled: true, bookingCount: activeBookings.length };
    });
  }
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
 * Check if an instructor already has a session on the same date.
 */
async function checkInstructorSessionConflict(params: {
  clubId: string;
  date: Date;
  instructorId: string;
  excludeSessionId?: string;
  status?: FlightSchoolSessionStatus;
}) {
  // If the new status is CANCELLED, it doesn't conflict with anything
  if (params.status === FlightSchoolSessionStatus.CANCELLED) {
    return;
  }

  const existingSession = await prisma.flightSchoolSession.findFirst({
    where: {
      clubId: params.clubId,
      date: {
        gte: startOfDay(params.date),
        lte: endOfDay(params.date),
      },
      instructorMemberProfileId: params.instructorId,
      status: { not: FlightSchoolSessionStatus.CANCELLED },
      id: params.excludeSessionId ? { not: params.excludeSessionId } : undefined,
    },
  });

  if (existingSession) {
    throw new Error("Instruktøren har allerede en skoledag på denne dato. Tilføj flere tider på den eksisterende skoledag.");
  }
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
    } as Prisma.FlightSchoolBookingUncheckedCreateInput
  });

  // 31. TODO: Add notification service seam here for later instructor notification
  // Example: await notifyInstructorOfNewBooking(booking.id);

  return booking;
}

/**
 * Cancel a member's own booking (Requirement 30).
 */
export async function cancelOwnBooking(bookingId: string, memberProfileId: string) {
  const updatedBooking = await prisma.$transaction(async (tx) => {
    const booking = await tx.flightSchoolBooking.findUniqueOrThrow({
      where: { id: bookingId },
    });

    if (booking.memberProfileId !== memberProfileId) {
      throw new Error("Not authorized to cancel this booking");
    }

    if (booking.status === FlightSchoolBookingStatus.CANCELLED) {
      return booking;
    }

    await tx.flightSchoolBooking.deleteMany({
      where: {
        flightSchoolTimeSlotId: booking.flightSchoolTimeSlotId,
        memberProfileId: booking.memberProfileId,
        status: FlightSchoolBookingStatus.CANCELLED,
        id: {
          not: booking.id,
        },
      },
    });

    return tx.flightSchoolBooking.update({
      where: { id: bookingId },
      data: {
        status: FlightSchoolBookingStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledById: memberProfileId,
      },
    });
  });

  // 31. TODO: Add notification service seam here for later instructor notification
  // Example: await notifyInstructorOfBookingCancellation(updatedBooking.id);

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
