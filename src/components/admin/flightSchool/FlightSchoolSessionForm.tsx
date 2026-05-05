"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Save, Plus, Clock, Calendar as CalendarIcon, Info, Trash2, Power, PowerOff } from "lucide-react";
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
  const router = useRouter();
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
      if (!date) throw new Error("Dato er påkrævet");
      if (!startsAt) throw new Error("Session starttid er påkrævet");
      if (!endsAt) throw new Error("Session sluttid er påkrævet");
      if (!instructorId) throw new Error("Instruktør er påkrævet");

      const sessionDate = new Date(date);
      const startDateTime = new Date(`${date}T${startsAt}`);
      const endDateTime = new Date(`${date}T${endsAt}`);

      if (isNaN(sessionDate.getTime())) throw new Error("Ugyldig dato");
      if (isNaN(startDateTime.getTime())) throw new Error("Ugyldig starttid");
      if (isNaN(endDateTime.getTime())) throw new Error("Ugyldig sluttid");

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
        if (!slot.startsAt) throw new Error(`Starttid mangler for tidsrum ${i + 1}`);
        
        const slotStart = new Date(`${date}T${slot.startsAt}`);
        const slotEnd = slot.endsAt ? new Date(`${date}T${slot.endsAt}`) : null;

        if (isNaN(slotStart.getTime())) throw new Error(`Ugyldig starttid for tidsrum ${i + 1}`);
        if (slotEnd && isNaN(slotEnd.getTime())) throw new Error(`Ugyldig sluttid for tidsrum ${i + 1}`);

        const slotData = {
          startsAt: slotStart,
          endsAt: slotEnd,
          capacity: 1,
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
      router.refresh();
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
    <div className="admin-modal-backdrop">
      <div className="admin-modal-panel max-w-5xl">
        <div className="admin-modal-header">
          <h3 className="admin-section-title flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-sky-400" />
            {initialData ? "Rediger session" : "Opret ny session"}
          </h3>
          <button onClick={onClose} className="admin-icon-button">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          {error && (
            <div className="admin-alert admin-alert-danger">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <h4 className="admin-kicker">Grundlæggende information</h4>
              
              <div className="admin-meta-box space-y-4">
                <div>
                  <label className="admin-form-label">Dato</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="admin-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="admin-form-label">Session Start</label>
                    <input
                      type="time"
                      required
                      value={startsAt}
                      onChange={(e) => setStartsAt(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="admin-form-label">Session Slut</label>
                    <input
                      type="time"
                      required
                      value={endsAt}
                      onChange={(e) => setEndsAt(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="admin-form-label">Instruktør</label>
                  <select
                    required
                    value={instructorId}
                    onChange={(e) => setInstructorId(e.target.value)}
                    className="admin-input"
                  >
                    <option value="" disabled>Vælg instruktør...</option>
                    {instructors.map((instructor) => (
                      <option key={instructor.id} value={instructor.id} >
                        {instructor.firstName} {instructor.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="admin-form-label">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as FlightSchoolSessionStatus)}
                    className="admin-input"
                  >
                    <option value="DRAFT" >Udkast (Draft)</option>
                    <option value="PUBLISHED" >Udgivet (Published)</option>
                    <option value="CANCELLED" >Aflyst (Cancelled)</option>
                  </select>
                </div>

                <div>
                  <label className="admin-form-label">Note (valgfri)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="admin-textarea"
                    placeholder="Evt. besked til elever..."
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="admin-kicker">Tidsrum (Slots)</h4>
                <button
                  type="button"
                  onClick={handleAddTimeSlot}
                  className="admin-btn admin-btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  Tilføj tid
                </button>
              </div>

              <div className="space-y-4">
                {slots.length === 0 ? (
                  <div className="admin-empty-state">
                    <Clock className="admin-empty-icon mb-4" />
                    <p className="admin-muted max-w-xs">Ingen tidsrum tilføjet endnu. Klik på "Tilføj tid" for at oprette det første tidsrum.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {/* Header for slots on larger screens */}
                    <div className="admin-slot-header hidden md:grid md:grid-cols-12 gap-4 px-4">
                      <div className="col-span-3">Start</div>
                      <div className="col-span-3">Slut</div>
                      <div className="col-span-2 text-center">Aktiv</div>
                      <div className="col-span-2 text-center">Status</div>
                      <div className="col-span-2 text-right">Handlinger</div>
                    </div>

                    {slots.map((slot) => (
                      <div key={slot.id} className={`admin-slot-row ${slot.isActive ? "" : "is-inactive"}`}>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          <div className="col-span-3">
                            <label className="admin-mobile-label md:hidden">Start</label>
                            <input
                              type="time"
                              value={slot.startsAt}
                              onChange={(e) => updateLocalSlot(slot.id, { startsAt: e.target.value })}
                              className="admin-input admin-input-sm"
                            />
                          </div>
                          <div className="col-span-3">
                            <label className="admin-mobile-label md:hidden">Slut</label>
                            <input
                              type="time"
                              value={slot.endsAt}
                              onChange={(e) => updateLocalSlot(slot.id, { endsAt: e.target.value })}
                              className="admin-input admin-input-sm"
                            />
                          </div>
                          <div className="col-span-2 flex justify-center">
                            <label className="admin-mobile-label md:hidden">Aktiv</label>
                            <button
                              type="button"
                              onClick={() => updateLocalSlot(slot.id, { isActive: !slot.isActive })}
                              className={`admin-icon-toggle ${slot.isActive ? "is-active" : "is-inactive"}`}
                              title={slot.isActive ? 'Deaktiver' : 'Aktiver'}
                            >
                              {slot.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                            </button>
                          </div>
                          <div className="col-span-2 text-center">
                            <label className="admin-mobile-label md:hidden">Status</label>
                            <div className="flex flex-col items-center">
                              <span className={`admin-slot-status ${slot.bookingCount > 0 ? "is-booked" : ""}`}>
                                {slot.bookingCount > 0 ? 'Booket' : 'Ledig'}
                              </span>
                            </div>
                          </div>
                          <div className="col-span-2 flex justify-end items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (slot.isNew || slot.bookingCount === 0) {
                                  removeLocalSlot(slot.id);
                                } else {
                                  updateLocalSlot(slot.id, { isActive: false });
                                }
                              }}
                              className="admin-icon-button-danger-soft"
                              title={slot.isNew || slot.bookingCount === 0 ? "Fjern" : "Deaktiver (pga. booking)"}
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

        <div className="admin-modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="admin-btn"
          >
            Annuller
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="admin-btn admin-btn-primary"
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
