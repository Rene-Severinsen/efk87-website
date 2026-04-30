"use client";

import { useState } from "react";
import { format } from "date-fns";
import { bookFlightSchoolSlotAction, cancelOwnFlightSchoolBookingAction } from "../../../../lib/flightSchool/flightSchoolActions";

interface FlightSchoolCalendarClientProps {
  session: any;
  clubId: string;
  clubSlug: string;
  memberProfileId?: string;
  isMember: boolean;
}

export default function FlightSchoolCalendarClient({ 
  session, 
  clubId, 
  clubSlug, 
  memberProfileId,
  isMember 
}: FlightSchoolCalendarClientProps) {
  const [loadingSlotId, setLoadingSlotId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBook = async (slotId: string) => {
    if (!isMember) return;
    
    setLoadingSlotId(slotId);
    setError(null);
    try {
      const result = await bookFlightSchoolSlotAction(clubId, clubSlug, slotId);
      if (result.error) {
        setError(result.error);
      }
    } catch (e: any) {
      setError(e.message || "Der opstod en fejl.");
    } finally {
      setLoadingSlotId(null);
    }
  };

  const handleCancel = async (bookingId: string, slotId: string) => {
    setLoadingSlotId(slotId);
    setError(null);
    try {
      const result = await cancelOwnFlightSchoolBookingAction(clubId, clubSlug, bookingId);
      if (result.error) {
        setError(result.error);
      }
    } catch (e: any) {
      setError(e.message || "Der opstod en fejl.");
    } finally {
      setLoadingSlotId(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {session.timeSlots.map((slot: any) => {
          const booking = slot.bookings[0]; // Each slot has max 1 active booking based on rules
          const isBookedByMe = memberProfileId && booking?.memberProfileId === memberProfileId;
          const isOccupied = booking && !isBookedByMe;
          const isInactive = !slot.isActive;
          const isLoading = loadingSlotId === slot.id;

          let statusLabel = "Ledig";
          let statusColor = "text-emerald-400";
          if (isBookedByMe) {
            statusLabel = "Booket af dig";
            statusColor = "text-sky-400";
          } else if (isOccupied) {
            statusLabel = "Optaget";
            statusColor = "text-amber-400/60";
          } else if (isInactive) {
            statusLabel = "Inaktiv";
            statusColor = "text-white/30";
          }

          return (
            <div 
              key={slot.id}
              className={`flex flex-col p-4 rounded-xl border transition-all ${
                isBookedByMe 
                  ? "bg-sky-500/10 border-sky-500/30" 
                  : isOccupied || isInactive
                    ? "bg-white/[0.02] border-white/5 opacity-60"
                    : "bg-white/5 border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="font-bold text-white">
                  {format(new Date(slot.startsAt), "HH:mm")}
                  {slot.endsAt && ` - ${format(new Date(slot.endsAt), "HH:mm")}`}
                </div>
                <div className={`text-xs uppercase tracking-tighter font-bold ${statusColor}`}>
                  {statusLabel}
                </div>
              </div>

              <div className="mt-auto">
                {isBookedByMe ? (
                  <button
                    onClick={() => handleCancel(booking.id, slot.id)}
                    disabled={!!loadingSlotId}
                    className="w-full py-2 px-4 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "Annullerer..." : "Afmeld"}
                  </button>
                ) : !isOccupied && !isInactive && isMember ? (
                  <button
                    onClick={() => handleBook(slot.id)}
                    disabled={!!loadingSlotId}
                    className="w-full py-2 px-4 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "Booker..." : "Book tid"}
                  </button>
                ) : (
                  <div className="h-9" /> // Spacer to keep height consistent
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
