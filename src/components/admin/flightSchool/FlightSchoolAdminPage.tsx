"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FlightSchoolPageForm from "./FlightSchoolPageForm";
import FlightSchoolDocumentList from "./FlightSchoolDocumentList";
import InstructorsPanel from "./InstructorsPanel";
import FlightSchoolCalendarTab from "./FlightSchoolCalendarTab";
interface Instructor {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

import { FlightSchoolPage, FlightSchoolDocument, FlightSchoolSession, FlightSchoolTimeSlot, FlightSchoolBooking, ClubMemberProfile } from "../../../generated/prisma";
import { AdminPageHeader } from "../AdminPagePrimitives";

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

interface FlightSchoolAdminPageProps {
  clubSlug: string;
  page: FlightSchoolPage | null;
  documents: FlightSchoolDocument[];
  instructors: Instructor[];
  sessions: SessionWithIncludes[];
}

const FlightSchoolAdminPage: React.FC<FlightSchoolAdminPageProps> = ({
  clubSlug,
  page,
  documents,
  instructors,
  sessions,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  
  const [activeTab, setActiveTab] = useState<"content" | "documents" | "calendar">("content");

  useEffect(() => {
    if (tabParam === "content" || tabParam === "documents" || tabParam === "calendar") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: "content" | "documents" | "calendar") => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <AdminPageHeader
        title="Flyveskole"
        description="Administrer flyveskolens indhold, dokumenter og se instruktører."
      />

      <div className="pt-6">

      <div className="admin-tabs mb-8 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          onClick={() => handleTabChange("content")}
          className={`admin-tab-button ${activeTab === "content" ? "is-active" : ""}`}
        >
          Sideindhold
        </button>
        <button
          onClick={() => handleTabChange("documents")}
          className={`admin-tab-button ${activeTab === "documents" ? "is-active" : ""}`}
        >
          Elevdokumenter
        </button>
        <button
          onClick={() => handleTabChange("calendar")}
          className={`admin-tab-button ${activeTab === "calendar" ? "is-active" : ""}`}
        >
          Skolekalender
        </button>
      </div>

      <div className="space-y-8">
        <div>
          {activeTab === "content" ? (
            <FlightSchoolPageForm clubSlug={clubSlug} initialData={page} />
          ) : activeTab === "documents" ? (
            <FlightSchoolDocumentList clubSlug={clubSlug} documents={documents} />
          ) : (
            <FlightSchoolCalendarTab 
              clubSlug={clubSlug} 
              sessions={sessions} 
              instructors={instructors}
            />
          )}
        </div>

        {activeTab !== "calendar" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <InstructorsPanel instructors={instructors} />
            
            <div className="admin-card">
              <h3 className="admin-section-title text-sm opacity-50">Information</h3>
              <div className="admin-muted text-sm space-y-3">
                <p>
                  Flyveskole-modulet bruges til at præsentere information for kommende og nuværende elever.
                </p>
                <p>
                  <strong>Sideindhold:</strong> Den overordnede velkomstside for flyveskolen.
                </p>
                <p>
                  <strong>Elevdokumenter:</strong> Dybere information, guider og materiale til eleverne.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default FlightSchoolAdminPage;
