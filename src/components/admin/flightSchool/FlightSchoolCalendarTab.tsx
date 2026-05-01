"use client";

import React, { useState } from "react";
import Avatar from "../../shared/Avatar";
import { Plus, Edit2, Clock, CheckCircle, ChevronRight, ChevronDown, Trash2, XCircle } from "lucide-react";
import { formatAdminDate, formatAdminTime, formatAdminDateTime } from "../../../lib/format/adminDateFormat";
import FlightSchoolSessionForm from "./FlightSchoolSessionForm";
import { FlightSchoolSessionStatus, FlightSchoolSession, FlightSchoolTimeSlot, FlightSchoolBooking, ClubMemberProfile } from "../../../generated/prisma";
import { deleteOrCancelSessionAction } from "../../../lib/admin/flightSchoolSessionActions";

type SessionWithIncludes = FlightSchoolSession & {
  instructor: ClubMemberProfile;
  timeSlots: (FlightSchoolTimeSlot & {
    bookings: (FlightSchoolBooking & {
      member: ClubMemberProfile;
    })[];
  })[];
  _count?: {
    timeSlots: number;
  };
};

interface Instructor {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

interface FlightSchoolCalendarTabProps {
  clubSlug: string;
  sessions: SessionWithIncludes[];
  instructors: Instructor[];
}

const FlightSchoolCalendarTab: React.FC<FlightSchoolCalendarTabProps> = ({
  clubSlug,
  sessions,
  instructors,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionWithIncludes | null>(null);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingSession(null);
    setIsFormOpen(true);
  };

  const handleEdit = (session: SessionWithIncludes) => {
    setEditingSession(session);
    setIsFormOpen(true);
  };

  const handleDelete = async (session: SessionWithIncludes, totalBookings: number) => {
    const actionText = totalBookings > 0 ? "aflyse" : "slette";
    const confirmMessage = totalBookings > 0 
      ? `Er du sikker på, at du vil aflyse denne session? Der er ${totalBookings} aktive bookinger, som vil blive aflyst. Instruktøren og eleverne skal have besked manuelt.`
      : `Er du sikker på, at du vil slette denne session? Dette kan ikke fortrydes.`;

    if (!window.confirm(confirmMessage)) return;

    setIsDeleting(session.id);
    try {
      await deleteOrCancelSessionAction(clubSlug, session.id);
    } catch (error) {
      console.error(`Failed to ${actionText} session:`, error);
      alert(`Der skete en fejl under forsøget på at ${actionText} sessionen.`);
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleExpand = (sessionId: string) => {
    setExpandedSessionId(expandedSessionId === sessionId ? null : sessionId);
  };

  const getStatusBadge = (status: FlightSchoolSessionStatus) => {
    switch (status) {
      case "PUBLISHED":
        return <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-medium">Udgivet</span>;
      case "DRAFT":
        return <span className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md text-xs font-medium">Udkast</span>;
      case "CANCELLED":
        return <span className="px-2 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md text-xs font-medium">Aflyst</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Skolekalender</h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Opret session
        </button>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-sm font-semibold text-slate-300">Dato</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-300">Tid</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-300">Instruktør</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-300">Status</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-300 text-center">Tider</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-300 text-center">Bookinger</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-300">Sidst ændret</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-300 text-right">Handlinger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sessions.map((session) => {
                const totalBookings = session.timeSlots.reduce((acc: number, slot) => 
                  acc + slot.bookings.filter((b) => b.status === "BOOKED").length, 0);
                
                return (
                  <React.Fragment key={session.id}>
                    <tr className={`hover:bg-white/5 transition-colors group ${expandedSessionId === session.id ? 'bg-white/5' : ''}`}>
                      <td className="px-4 py-4 text-sm text-white font-medium">
                        {formatAdminDate(session.date)}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-300">
                        {session.startsAt ? formatAdminTime(session.startsAt).substring(0, 5) : "-"}
                        {session.endsAt ? ` - ${formatAdminTime(session.endsAt).substring(0, 5)}` : ""}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                          <Avatar 
                            imageUrl={session.instructor.profileImageUrl} 
                            name={`${session.instructor.firstName} ${session.instructor.lastName}`}
                            size="sm"
                          />
                          {session.instructor.firstName} {session.instructor.lastName}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {getStatusBadge(session.status)}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-300 text-center">
                        {session._count?.timeSlots || 0}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-300 text-center">
                        {totalBookings}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-400">
                        {formatAdminDateTime(session.updatedAt)}
                      </td>
                      <td className="px-4 py-4 text-sm text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => toggleExpand(session.id)}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                            title="Se tider og bookinger"
                          >
                            {expandedSessionId === session.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleEdit(session)}
                            className="p-2 text-slate-400 hover:text-sky-400 transition-colors"
                            title="Rediger session"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(session, totalBookings)}
                            disabled={isDeleting === session.id}
                            className={`p-2 transition-colors ${
                              isDeleting === session.id 
                                ? "text-slate-600 cursor-not-allowed" 
                                : totalBookings > 0 
                                  ? "text-slate-400 hover:text-amber-500" 
                                  : "text-slate-400 hover:text-rose-500"
                            }`}
                            title={totalBookings > 0 ? "Aflys session" : "Slet session"}
                          >
                            {totalBookings > 0 ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedSessionId === session.id && (
                      <tr className="bg-black/20">
                        <td colSpan={8} className="px-8 py-4">
                          <div className="space-y-4">
                            <h4 className="text-sm font-bold text-sky-400 uppercase tracking-wider">Tider og Bookinger</h4>
                            {session.timeSlots.length === 0 ? (
                              <p className="text-sm text-slate-500 italic">Ingen tider oprettet for denne session.</p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {session.timeSlots.map((slot) => (
                                  <div key={slot.id} className={`p-3 rounded-lg border ${slot.isActive ? 'bg-white/5 border-white/10' : 'bg-rose-500/5 border-rose-500/20 opacity-60'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex items-center gap-2 text-white font-medium">
                                        <Clock className="w-3 h-3 text-sky-400" />
                                        {formatAdminTime(slot.startsAt).substring(0, 5)} 
                                        {slot.endsAt ? ` - ${formatAdminTime(slot.endsAt).substring(0, 5)}` : ""}
                                      </div>
                                      {!slot.isActive && (
                                        <span className="text-[10px] px-1.5 py-0.5 bg-rose-500/20 text-rose-400 rounded border border-rose-500/20 uppercase font-bold">Inaktiv</span>
                                      )}
                                    </div>
                                    <div className="space-y-2">
                                      <div className="text-[11px] text-slate-400 uppercase font-bold tracking-tight">Bookinger</div>
                                      {slot.bookings.filter((b) => b.status === "BOOKED").length === 0 ? (
                                        <div className="text-xs text-slate-500">Ingen bookinger endnu</div>
                                      ) : (
                                        <ul className="space-y-1">
                                          {slot.bookings.filter((b) => b.status === "BOOKED").map((booking) => (
                                            <li key={booking.id} className="text-xs text-slate-300 flex items-center gap-2">
                                              <CheckCircle className="w-3 h-3 text-emerald-500" />
                                              {booking.member.firstName} {booking.member.lastName}
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500 italic">
                    Ingen sessioner fundet. Opret din første session for at komme i gang.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <FlightSchoolSessionForm
          clubSlug={clubSlug}
          initialData={editingSession}
          instructors={instructors}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

export default FlightSchoolCalendarTab;
