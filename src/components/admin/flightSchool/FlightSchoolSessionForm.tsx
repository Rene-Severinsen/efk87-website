"use client";

import React, { useState } from "react";
import { X, Save, Plus, Clock, Calendar as CalendarIcon, Info } from "lucide-react";
import { createSessionAction, updateSessionAction, createTimeSlotAction, updateTimeSlotAction } from "../../../lib/admin/flightSchoolSessionActions";
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

  // Time slots (only for editing existing session)
  const timeSlots = initialData?.timeSlots || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const sessionDate = new Date(date);
      const startDateTime = new Date(`${date}T${startsAt}`);
      const endDateTime = new Date(`${date}T${endsAt}`);

      const data = {
        date: sessionDate,
        startsAt: startDateTime,
        endsAt: endDateTime,
        instructorMemberProfileId: instructorId,
        status,
        note,
      };

      if (initialData) {
        await updateSessionAction(clubSlug, initialData.id, data);
      } else {
        await createSessionAction(clubSlug, data);
        // If we want to allow slot management immediately, we'd need to redirect or update state
        // For now, closing is fine as per typical flow
      }
      onClose();
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

  const handleAddTimeSlot = async () => {
    if (!initialData) return;
    
    setLoading(true);
    try {
      // Default new slot: 1 hour long, at the end of existing slots or session start
      let lastEnd = startsAt;
      if (timeSlots.length > 0) {
        const sorted = [...timeSlots].sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
        if (sorted[0].endsAt) {
            lastEnd = new Date(sorted[0].endsAt).toTimeString().substring(0, 5);
        }
      }

      const nextHour = (parseInt(lastEnd.split(':')[0]) + 1).toString().padStart(2, '0');
      const nextEnd = `${nextHour}:${lastEnd.split(':')[1]}`;

      await createTimeSlotAction(clubSlug, initialData.id, {
        startsAt: new Date(`${date}T${lastEnd}`),
        endsAt: new Date(`${date}T${nextEnd}`),
        capacity: 1,
        sortOrder: timeSlots.length,
      });
      
      // We rely on server action revalidating path, but since we are in a client component modal,
      // we might want to refresh the slots. For simplicity in this iteration, we tell user to save/refresh or we can just update local state if we had the ID back.
      // But requirement says "revalidatePath" is used.
      window.location.reload(); // Hard refresh to get new slots for now, simple and reliable
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Der skete en ukendt fejl");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSlotActive = async (slotId: string, currentActive: boolean) => {
    setLoading(true);
    try {
        await updateTimeSlotAction(clubSlug, slotId, { isActive: !currentActive });
        window.location.reload();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Der skete en ukendt fejl");
      }
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-sky-400 uppercase tracking-wider">Grundlæggende information</h4>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Dato</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Start tid</label>
                  <input
                    type="time"
                    required
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Slut tid</label>
                  <input
                    type="time"
                    required
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Instruktør</label>
                <select
                  required
                  value={instructorId}
                  onChange={(e) => setInstructorId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500 transition-colors"
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
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500 transition-colors"
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
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500 transition-colors resize-none"
                  placeholder="Evt. besked til elever..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-sky-400 uppercase tracking-wider">Tidsrum (Slots)</h4>
                {initialData && (
                  <button
                    type="button"
                    onClick={handleAddTimeSlot}
                    className="flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Tilføj tid
                  </button>
                )}
              </div>

              {!initialData ? (
                <div className="p-6 bg-white/5 border border-dashed border-white/10 rounded-xl flex flex-col items-center text-center">
                    <Info className="w-8 h-8 text-slate-500 mb-2" />
                    <p className="text-sm text-slate-400">
                        Du skal gemme sessionen før du kan administrere specifikke tidsrum.
                    </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {timeSlots.map((slot) => (
                    <div key={slot.id} className={`p-4 rounded-xl border ${slot.isActive ? 'bg-white/5 border-white/10' : 'bg-rose-500/5 border-rose-500/20'}`}>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2 text-white font-medium">
                          <Clock className="w-4 h-4 text-sky-400" />
                          {new Date(slot.startsAt).toTimeString().substring(0, 5)} - {slot.endsAt ? new Date(slot.endsAt).toTimeString().substring(0, 5) : "??:??"}
                        </div>
                        <div className="flex items-center gap-2">
                           <button
                            type="button"
                            onClick={() => handleToggleSlotActive(slot.id, slot.isActive)}
                            className={`text-xs px-2 py-1 rounded border transition-colors ${
                                slot.isActive 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                            }`}
                           >
                            {slot.isActive ? 'Aktiv' : 'Inaktiv'}
                           </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Kapacitet: {slot.capacity}</span>
                        <span>Bookinger: {slot.bookings.filter((b) => b.status === 'BOOKED').length}</span>
                      </div>
                    </div>
                  ))}
                  {timeSlots.length === 0 && (
                    <p className="text-sm text-slate-500 italic text-center py-4">Ingen tider oprettet.</p>
                  )}
                </div>
              )}
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
