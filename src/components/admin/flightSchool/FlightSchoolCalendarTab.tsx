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
        return <span className="admin-badge admin-badge-success">Udgivet</span>;
      case "DRAFT":
        return <span className="admin-badge admin-badge-warning">Udkast</span>;
      case "CANCELLED":
        return <span className="admin-badge admin-badge-danger">Aflyst</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="admin-section-title">Skolekalender</h2>
        <button
          onClick={handleCreate}
          className="admin-btn admin-btn-primary"
        >
          <Plus className="w-4 h-4" />
          Opret session
        </button>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr >
                <th >Dato</th>
                <th >Tid</th>
                <th >Instruktør</th>
                <th >Status</th>
                <th className="text-center">Tider</th>
                <th className="text-center">Bookinger</th>
                <th >Sidst ændret</th>
                <th className="text-right">Handlinger</th>
              </tr>
            </thead>
            <tbody >
              {sessions.map((session) => {
                const totalBookings = session.timeSlots.reduce((acc: number, slot) => 
                  acc + slot.bookings.filter((b) => b.status === "BOOKED").length, 0);
                
                return (
                  <React.Fragment key={session.id}>
                    <tr className={`admin-table-row ${expandedSessionId === session.id ? "is-expanded" : ""}`}>
                      <td className="admin-strong text-sm">
                        {formatAdminDate(session.date)}
                      </td>
                      <td className="admin-muted text-sm">
                        {session.startsAt ? formatAdminTime(session.startsAt).substring(0, 5) : "-"}
                        {session.endsAt ? ` - ${formatAdminTime(session.endsAt).substring(0, 5)}` : ""}
                      </td>
                      <td className="admin-muted text-sm">
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
                      <td className="admin-muted text-sm text-center">
                        {session._count?.timeSlots || 0}
                      </td>
                      <td className="admin-muted text-sm text-center">
                        {totalBookings}
                      </td>
                      <td className="admin-muted text-sm">
                        {formatAdminDateTime(session.updatedAt)}
                      </td>
                      <td className="px-4 py-4 text-sm text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => toggleExpand(session.id)}
                            className="admin-icon-button"
                            title="Se tider og bookinger"
                          >
                            {expandedSessionId === session.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleEdit(session)}
                            className="admin-icon-button"
                            title="Rediger session"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(session, totalBookings)}
                            disabled={isDeleting === session.id}
                            className={`admin-icon-button-danger-soft ${isDeleting === session.id ? "is-disabled" : ""}`}
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
                      <tr className="admin-expanded-row">
                        <td colSpan={8} className="px-8 py-4">
                          <div className="space-y-4">
                            <h4 className="admin-kicker">Tider og Bookinger</h4>
                            {session.timeSlots.length === 0 ? (
                              <p className="admin-form-help italic">Ingen tider oprettet for denne session.</p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {session.timeSlots.map((slot) => (
                                  <div key={slot.id} className={`admin-slot-card ${slot.isActive ? "" : "is-inactive"}`}>
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="admin-strong flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-sky-400" />
                                        {formatAdminTime(slot.startsAt).substring(0, 5)} 
                                        {slot.endsAt ? ` - ${formatAdminTime(slot.endsAt).substring(0, 5)}` : ""}
                                      </div>
                                      {!slot.isActive && (
                                        <span className="admin-badge admin-badge-danger">Inaktiv</span>
                                      )}
                                    </div>
                                    <div className="space-y-2">
                                      <div className="admin-meta-label">Bookinger</div>
                                      {slot.bookings.filter((b) => b.status === "BOOKED").length === 0 ? (
                                        <div className="admin-muted text-xs">Ingen bookinger endnu</div>
                                      ) : (
                                        <ul className="space-y-1">
                                          {slot.bookings.filter((b) => b.status === "BOOKED").map((booking) => (
                                            <li key={booking.id} className="admin-muted text-xs flex items-center gap-2">
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
                  <td colSpan={8} className="admin-form-help text-center italic">
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
