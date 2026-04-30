"use server";

import { revalidatePath } from "next/cache";
import { getServerViewerForClub } from "../auth/viewer";
import { bookSlot, cancelOwnBooking } from "./flightSchoolBookingService";
import prisma from "../db/prisma";

/**
 * Public server action to book a flight school slot.
 */
export async function bookFlightSchoolSlotAction(clubId: string, clubSlug: string, slotId: string) {
  const viewer = await getServerViewerForClub(clubId);

  if (!viewer.isAuthenticated || !viewer.isMember || !viewer.userId) {
    throw new Error("Du skal være logget ind som aktivt medlem for at booke en skoletid.");
  }

  // Get member profile ID
  const profile = await prisma.clubMemberProfile.findUnique({
    where: {
      clubId_userId: {
        clubId,
        userId: viewer.userId,
      },
    },
    select: { id: true },
  });

  if (!profile) {
    throw new Error("Kunne ikke finde din medlemsprofil.");
  }

  try {
    await bookSlot(clubId, profile.id, slotId);
    
    // TODO: Add notification seam for instructor here.
    // Point 37 of requirements.
    
    revalidatePath(`/${clubSlug}/flyveskole/skolekalender`);
    return { success: true };
  } catch (error: any) {
    console.error("Booking error:", error);
    return { 
      error: error.message || "Der opstod en fejl ved booking af tiden. Prøv venligst igen." 
    };
  }
}

/**
 * Public server action to cancel own flight school booking.
 */
export async function cancelOwnFlightSchoolBookingAction(clubId: string, clubSlug: string, bookingId: string) {
  const viewer = await getServerViewerForClub(clubId);

  if (!viewer.isAuthenticated || !viewer.userId) {
    throw new Error("Du skal være logget ind for at afmelde en booking.");
  }

  // Get member profile ID
  const profile = await prisma.clubMemberProfile.findUnique({
    where: {
      clubId_userId: {
        clubId,
        userId: viewer.userId,
      },
    },
    select: { id: true },
  });

  if (!profile) {
    throw new Error("Kunne ikke finde din medlemsprofil.");
  }

  try {
    await cancelOwnBooking(bookingId, profile.id);
    
    revalidatePath(`/${clubSlug}/flyveskole/skolekalender`);
    return { success: true };
  } catch (error: any) {
    console.error("Cancellation error:", error);
    return { 
      error: error.message || "Der opstod en fejl ved afmelding af tiden. Prøv venligst igen." 
    };
  }
}
