"use server";

import { revalidatePath } from "next/cache";
import { getServerViewerForClub } from "../auth/viewer";
import { bookSlot, cancelOwnBooking } from "./flightSchoolBookingService";
import { getMemberProfileId } from "../members/memberProfileService";

/**
 * Public server action to book a flight school slot.
 */
export async function bookFlightSchoolSlotAction(clubId: string, clubSlug: string, slotId: string) {
  const viewer = await getServerViewerForClub(clubId);

  if (!viewer.isAuthenticated || !viewer.isMember || !viewer.userId) {
    return { error: "Du skal være logget ind som aktivt medlem for at booke en skoletid." };
  }

  // Get member profile ID using service helper instead of direct prisma
  const profileId = await getMemberProfileId(clubId, viewer.userId);

  if (!profileId) {
    return { error: "Kunne ikke finde din medlemsprofil." };
  }

  try {
    await bookSlot(clubId, profileId, slotId);
    
    // TODO: Add notification seam for instructor here.
    // Point 37 of requirements.
    
    revalidatePath(`/${clubSlug}/flyveskole/skolekalender`);
    return { success: true };
  } catch (error: unknown) {
    console.error("Booking error:", error);
    const message = error instanceof Error ? error.message : "Der opstod en uventet fejl.";
    return { 
      error: message || "Der opstod en fejl ved booking af tiden. Prøv venligst igen." 
    };
  }
}

/**
 * Public server action to cancel own flight school booking.
 */
export async function cancelOwnFlightSchoolBookingAction(clubId: string, clubSlug: string, bookingId: string) {
  const viewer = await getServerViewerForClub(clubId);

  if (!viewer.isAuthenticated || !viewer.userId) {
    return { error: "Du skal være logget ind for at afmelde en booking." };
  }

  // Get member profile ID using service helper instead of direct prisma
  const profileId = await getMemberProfileId(clubId, viewer.userId);

  if (!profileId) {
    return { error: "Kunne ikke finde din medlemsprofil." };
  }

  try {
    await cancelOwnBooking(bookingId, profileId);
    
    revalidatePath(`/${clubSlug}/flyveskole/skolekalender`);
    return { success: true };
  } catch (error: unknown) {
    console.error("Cancellation error:", error);
    const message = error instanceof Error ? error.message : "Der opstod en uventet fejl.";
    return { 
      error: message || "Der opstod en fejl ved afmelding af tiden. Prøv venligst igen." 
    };
  }
}
