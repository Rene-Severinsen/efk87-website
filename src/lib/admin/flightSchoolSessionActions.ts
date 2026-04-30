"use server";

import { revalidatePath } from "next/cache";
import { requireClubBySlug } from "../tenancy/tenantService";
import { requireClubAdminForClub } from "../auth/adminAccessGuards";
import * as flightSchoolBookingService from "../flightSchool/flightSchoolBookingService";
import { FlightSchoolSessionStatus } from "../../generated/prisma";

export async function createSessionAction(clubSlug: string, data: {
  date: Date;
  startsAt: Date | null;
  endsAt: Date | null;
  instructorMemberProfileId: string;
  status: FlightSchoolSessionStatus;
  note: string | null;
}) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug);

  const session = await flightSchoolBookingService.createSession({
    clubId: club.id,
    date: data.date,
    startsAt: data.startsAt,
    endsAt: data.endsAt,
    instructorMemberProfileId: data.instructorMemberProfileId,
    status: data.status,
    note: data.note,
  });

  revalidatePath(`/${clubSlug}/admin/flyveskole`);
  return { success: true, id: session.id };
}

export async function updateSessionAction(clubSlug: string, id: string, data: {
  date: Date;
  startsAt: Date | null;
  endsAt: Date | null;
  instructorMemberProfileId: string;
  status: FlightSchoolSessionStatus;
  note: string | null;
}) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug);

  await flightSchoolBookingService.updateSession(id, {
    date: data.date,
    startsAt: data.startsAt,
    endsAt: data.endsAt,
    instructorMemberProfileId: data.instructorMemberProfileId,
    status: data.status,
    note: data.note,
  });

  revalidatePath(`/${clubSlug}/admin/flyveskole`);
  return { success: true };
}

export async function createTimeSlotAction(clubSlug: string, sessionId: string, data: {
  startsAt: Date;
  endsAt: Date | null;
  capacity: number;
  sortOrder: number;
  isActive?: boolean;
}) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug);

  await flightSchoolBookingService.createTimeSlot({
    clubId: club.id,
    flightSchoolSessionId: sessionId,
    startsAt: data.startsAt,
    endsAt: data.endsAt,
    capacity: data.capacity,
    sortOrder: data.sortOrder,
    isActive: data.isActive !== false,
  });

  revalidatePath(`/${clubSlug}/admin/flyveskole`);
  return { success: true };
}

export async function updateTimeSlotAction(clubSlug: string, id: string, data: {
  startsAt?: Date;
  endsAt?: Date | null;
  capacity?: number;
  sortOrder?: number;
  isActive?: boolean;
}) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug);

  await flightSchoolBookingService.updateTimeSlot(id, {
    startsAt: data.startsAt,
    endsAt: data.endsAt,
    capacity: data.capacity,
    sortOrder: data.sortOrder,
    isActive: data.isActive,
  });

  revalidatePath(`/${clubSlug}/admin/flyveskole`);
  return { success: true };
}

export async function deactivateTimeSlotAction(clubSlug: string, id: string) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(club.id, clubSlug);

  await flightSchoolBookingService.cancelTimeSlot(id);

  revalidatePath(`/${clubSlug}/admin/flyveskole`);
  return { success: true };
}
