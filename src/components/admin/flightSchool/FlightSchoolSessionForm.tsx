"use client";

import React, { useState } from "react";
import { X, Save, Plus, Clock, Calendar as CalendarIcon, Info, Trash2 } from "lucide-react";
import { createSessionAction, updateSessionAction, createTimeSlotAction, updateTimeSlotAction, deactivateTimeSlotAction } from "../../../lib/admin/flightSchoolSessionActions";
import { FlightSchoolSessionStatus, FlightSchoolSession, FlightSchoolTimeSlot, FlightSchoolBooking, ClubMemberProfile } from "../../../generated/prisma";

type SessionWithIncludes = FlightSchoolSession & {
  instructor: ClubMemberProfile;
  timeSlots: (FlightSchoolTimeSlot & {
    bookings: (FlightSchoolBooking & {
      member: ClubMemberProfile;
    })[];
  })[];
};

interface Instructor {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

interface FlightSchoolSessionFormProps {
  clubSlug: string;
  initialData: SessionWithIncludes | null;
  instructors: Instructor[];
  onClose: () => void;
}

interface LocalTimeSlot {
  id: string; // Temporary ID for new slots (e.g., 'new-1'), real ID for existing
  startsAt: string; // HH:mm
  endsAt: string; // HH:mm
  capacity: number;
  isActive: boolean;
  isNew: boolean;
  bookingCount: number;
}

const FlightSchoolSessionForm: React.FC<FlightSchoolSessionFormProps> = ({
  clubSlug,
  initialData,
  instructors,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Session fields
  const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : "");
  const [startsAt, setStartsAt] = useState(initialData?.startsAt ? new Date(initialData.startsAt).toTimeString().substring(0, 5) : "09:00");
  const [endsAt, setEndsAt] = useState(initialData?.endsAt ? new Date(initialData.endsAt).toTimeString().substring(0, 5) : "16:00");
  const [instructorId, setInstructorId] = useState(initialData?.instructorMemberProfileId || "");
  const [status, setStatus] = useState<FlightSchoolSessionStatus>(initialData?.status || "DRAFT");
  const [note, setNote] = useState(initialData?.note || "");

  // Local slots state
  const [slots, setSlots] = useState<LocalTimeSlot[]>(
    (initialData?.timeSlots || [])
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
      .map(slot => ({
        id: slot.id,
        startsAt: new Date(slot.startsAt).toTimeString().substring(0, 5),
        endsAt: slot.endsAt ? new Date(slot.endsAt).toTimeString().substring(0, 5) : "",
        capacity: slot.capacity,
        isActive: slot.isActive,
        isNew: false,
        bookingCount: slot.bookings.filter(b => b.status === 'BOOKED').length
      }))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const sessionDate = new Date(date);
      const startDateTime = new Date(`${date}T${startsAt}`);
      const endDateTime = new Date(`${date}T${endsAt}`);

      const sessionData = {
        date: sessionDate,
        startsAt: startDateTime,
        endsAt: endDateTime,
        instructorMemberProfileId: instructorId,
        status,
        note,
      };

      let sessionId = initialData?.id;

      if (initialData) {
        await updateSessionAction(clubSlug, initialData.id, sessionData);
      } else {
        const res = await createSessionAction(clubSlug, sessionData);
        sessionId = res.id;
      }

      if (!sessionId) throw new Error("Kunne ikke finde eller oprette session ID");

      // Save all slots
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        const slotData = {
          startsAt: new Date(`${date}T${slot.startsAt}`),
          endsAt: slot.endsAt ? new Date(`${date}T${slot.endsAt}`) : null,
          capacity: slot.capacity,
          isActive: slot.isActive,
          sortOrder: i,
        };

        if (slot.isNew) {
          await createTimeSlotAction(clubSlug, sessionId, slotData);
        } else {
          // If deactivated and has bookings, the action handles it as a cancellation logic usually 
          // but here we use updateTimeSlotAction which just sets isActive.
          // requirement 22: "Existing slots with bookings must not be hard deleted; they must be deactivated."
          await updateTimeSlotAction(clubSlug, slot.id, slotData);
        }
      }

      // Handle removed slots (those that were in initialData but not in current slots state)
      if (initialData) {
        const initialSlotIds = initialData.timeSlots.map(s => s.id);
        const currentSlotIds = slots.filter(s => !s.isNew).map(s => s.id);
        const removedSlotIds = initialSlotIds.filter(id => !currentSlotIds.includes(id));

        for (const removedId of removedSlotIds) {
          // Requirement 22: Existing slots with bookings must not be hard deleted; they must be deactivated.
          // deactivateTimeSlotAction usually handles this safety.
          await deactivateTimeSlotAction(clubSlug, removedId);
        }
      }

      onClose();
      window.location.reload(); // To refresh the calendar view
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Der skete en fejl");
      } else {
        setError("Der skete en ukendt fejl");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddTimeSlot = () => {
    // Default new slot
    let lastEnd = "09:00";
    if (slots.length > 0) {
      const lastSlot = slots[slots.length - 1];
      if (lastSlot.endsAt) {
        lastEnd = lastSlot.endsAt;
      } else {
        lastEnd = lastSlot.startsAt;
      }
    } else if (startsAt) {
      lastEnd = startsAt;
    }

    const startParts = lastEnd.split(':');
    let nextHour = parseInt(startParts[0]) + 1;
    if (nextHour > 23) nextHour = 23;
    const nextEnd = `${nextHour.toString().padStart(2, '0')}:${startParts[1]}`;

    const newSlot: LocalTimeSlot = {
      id: `new-${Date.now()}`,
      startsAt: lastEnd,
      endsAt: nextEnd,
      capacity: 1,
      isActive: true,
      isNew: true,
      bookingCount: 0
    };

    setSlots([...slots, newSlot]);
  };

  const updateLocalSlot = (id: string, updates: Partial<LocalTimeSlot>) => {
    setSlots(slots.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeLocalSlot = (id: string) => {
    setSlots(slots.filter(s => s.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-sky-400" />
            {initialData ? "Rediger session" : "Opret ny session"}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <h4 className="text-sm font-bold text-sky-400 uppercase tracking-wider">Grundlæggende information</h4>
              
              <div className="space-y-4 bg-white/5 p-5 rounded-xl border border-white/5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Dato</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Session Start</label>
                    <input
                      type="time"
                      required
                      value={startsAt}
                      onChange={(e) => setStartsAt(e.target.value)}
                      className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Session Slut</label>
                    <input
                      type="time"
                      required
                      value={endsAt}
                      onChange={(e) => setEndsAt(e.target.value)}
                      className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Instruktør</label>
                  <select
                    required
                    value={instructorId}
                    onChange={(e) => setInstructorId(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500 transition-colors"
                  >
                    <option value="" disabled className="bg-slate-900 text-slate-500">Vælg instruktør...</option>
                    {instructors.map((instructor) => (
                      <option key={instructor.id} value={instructor.id} className="bg-slate-900 text-white">
                        {instructor.firstName} {instructor.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as FlightSchoolSessionStatus)}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500 transition-colors"
                  >
                    <option value="DRAFT" className="bg-slate-900">Udkast (Draft)</option>
                    <option value="PUBLISHED" className="bg-slate-900">Udgivet (Published)</option>
                    <option value="CANCELLED" className="bg-slate-900">Aflyst (Cancelled)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Note (valgfri)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500 transition-colors resize-none"
                    placeholder="Evt. besked til elever..."
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-sky-400 uppercase tracking-wider">Tidsrum (Slots)</h4>
                <button
                  type="button"
                  onClick={handleAddTimeSlot}
                  className="flex items-center gap-2 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg text-sm font-bold transition-colors border border-sky-500/20"
                >
                  <Plus className="w-4 h-4" />
                  Tilføj tid
                </button>
              </div>

              <div className="space-y-4">
                {slots.length === 0 ? (
                  <div className="p-12 bg-white/5 border border-dashed border-white/10 rounded-2xl flex flex-col items-center text-center">
                    <Clock className="w-12 h-12 text-slate-600 mb-4" />
                    <p className="text-slate-400 max-w-xs">Ingen tidsrum tilføjet endnu. Klik på "Tilføj tid" for at oprette det første tidsrum.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {/* Header for slots on larger screens */}
                    <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <div className="col-span-3">Start</div>
                      <div className="col-span-3">Slut</div>
                      <div className="col-span-2 text-center">Kapacitet</div>
                      <div className="col-span-2 text-center">Status</div>
                      <div className="col-span-2 text-right">Handlinger</div>
                    </div>

                    {slots.map((slot) => (
                      <div key={slot.id} className={`p-4 rounded-xl border transition-all ${slot.isActive ? 'bg-white/5 border-white/10' : 'bg-rose-500/5 border-rose-500/20 opacity-80'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          <div className="col-span-3">
                            <label className="md:hidden block text-[10px] font-bold text-slate-500 uppercase mb-1">Start</label>
                            <input
                              type="time"
                              value={slot.startsAt}
                              onChange={(e) => updateLocalSlot(slot.id, { startsAt: e.target.value })}
                              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                            />
                          </div>
                          <div className="col-span-3">
                            <label className="md:hidden block text-[10px] font-bold text-slate-500 uppercase mb-1">Slut</label>
                            <input
                              type="time"
                              value={slot.endsAt}
                              onChange={(e) => updateLocalSlot(slot.id, { endsAt: e.target.value })}
                              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="md:hidden block text-[10px] font-bold text-slate-500 uppercase mb-1">Kapacitet</label>
                            <input
                              type="number"
                              min="1"
                              value={slot.capacity}
                              onChange={(e) => updateLocalSlot(slot.id, { capacity: parseInt(e.target.value) || 1 })}
                              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white text-center focus:outline-none focus:border-sky-500 transition-colors"
                            />
                          </div>
                          <div className="col-span-2 flex justify-center">
                            <label className="md:hidden block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
                            <button
                              type="button"
                              onClick={() => updateLocalSlot(slot.id, { isActive: !slot.isActive })}
                              className={`text-[10px] px-3 py-1 rounded-full border font-bold transition-all uppercase tracking-wider ${
                                  slot.isActive 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                              }`}
                            >
                              {slot.isActive ? 'Aktiv' : 'Inaktiv'}
                            </button>
                          </div>
                          <div className="col-span-2 flex justify-end items-center gap-3">
                            <div className="text-right">
                              <div className="text-[10px] text-slate-500 uppercase font-bold leading-none">Bookinger</div>
                              <div className="text-sm font-bold text-white">{slot.bookingCount}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeLocalSlot(slot.id)}
                              className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                              title="Fjern tidsrum"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            Annuller
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-lg shadow-sky-500/20"
          >
            {loading ? "Gemmer..." : (
              <>
                <Save className="w-4 h-4" />
                Gem session
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightSchoolSessionForm;
