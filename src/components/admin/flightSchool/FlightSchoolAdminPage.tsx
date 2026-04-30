"use client";

import React, { useState } from "react";
import FlightSchoolPageForm from "./FlightSchoolPageForm";
import FlightSchoolDocumentList from "./FlightSchoolDocumentList";
import InstructorsPanel from "./InstructorsPanel";
import { FlightSchoolPage, FlightSchoolDocument } from "../../../generated/prisma";

interface Instructor {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

interface FlightSchoolAdminPageProps {
  clubSlug: string;
  page: FlightSchoolPage | null;
  documents: FlightSchoolDocument[];
  instructors: Instructor[];
}

const FlightSchoolAdminPage: React.FC<FlightSchoolAdminPageProps> = ({
  clubSlug,
  page,
  documents,
  instructors,
}) => {
  const [activeTab, setActiveTab] = useState<"content" | "documents">("content");

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Flyveskole</h1>
        <p className="text-slate-400">
          Administrer flyveskolens indhold, dokumenter og se instruktører.
        </p>
      </div>

      <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-8 w-full">
        <button
          onClick={() => setActiveTab("content")}
          className={`flex-1 px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === "content"
              ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Sideindhold
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`flex-1 px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === "documents"
              ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Elevdokumenter
        </button>
      </div>

      <div className="space-y-8">
        <div>
          {activeTab === "content" ? (
            <FlightSchoolPageForm clubSlug={clubSlug} initialData={page} />
          ) : (
            <FlightSchoolDocumentList clubSlug={clubSlug} documents={documents} />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <InstructorsPanel instructors={instructors} />
          
          <div className="admin-card">
            <h3 className="admin-section-title text-sm opacity-50">Information</h3>
            <div className="text-sm text-slate-400 space-y-3">
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
      </div>
    </div>
  );
};

export default FlightSchoolAdminPage;
