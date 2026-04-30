"use client";

import React, { useState } from "react";
import { FlightSchoolDocument } from "../../../generated/prisma";
import FlightSchoolDocumentForm from "./FlightSchoolDocumentForm";
import { deleteFlightSchoolDocumentAction } from "../../../lib/admin/flightSchoolActions";
import { formatAdminDateTime } from "../../../lib/format/adminDateFormat";

interface FlightSchoolDocumentListProps {
  clubSlug: string;
  documents: FlightSchoolDocument[];
}

const FlightSchoolDocumentList: React.FC<FlightSchoolDocumentListProps> = ({
  clubSlug,
  documents,
}) => {
  const [editingDocument, setEditingDocument] = useState<FlightSchoolDocument | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Er du sikker på, at du vil slette dette dokument?")) {
      return;
    }

    try {
      await deleteFlightSchoolDocumentAction(clubSlug, id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Der skete en fejl ved sletning");
    }
  };

  if (isCreating) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Nyt elevdokument</h3>
          <button
            onClick={() => setIsCreating(false)}
            className="admin-btn admin-btn-ghost"
          >
            Annuller
          </button>
        </div>
        <FlightSchoolDocumentForm
          clubSlug={clubSlug}
          onSuccess={() => setIsCreating(false)}
        />
      </div>
    );
  }

  if (editingDocument) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Rediger: {editingDocument.title}</h3>
          <button
            onClick={() => setEditingDocument(null)}
            className="admin-btn admin-btn-ghost"
          >
            Annuller
          </button>
        </div>
        <FlightSchoolDocumentForm
          clubSlug={clubSlug}
          initialData={editingDocument}
          onSuccess={() => setEditingDocument(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Elevdokumenter</h3>
        <button
          onClick={() => setIsCreating(true)}
          className="admin-btn admin-btn-primary"
        >
          Opret dokument
        </button>
      </div>

      <div className="admin-card p-0 overflow-hidden">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="w-[100px]">Sortering</th>
                <th className="min-w-[200px]">Titel</th>
                <th className="min-w-[200px]">Slug</th>
                <th className="w-[120px]">Status</th>
                <th className="w-[180px]">Sidst ændret</th>
                <th className="text-right w-[180px] whitespace-nowrap">Handlinger</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Ingen elevdokumenter fundet.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.sortOrder}</td>
                    <td className="font-medium">{doc.title}</td>
                    <td className="text-slate-400">{doc.slug}</td>
                    <td>
                      {doc.isPublished ? (
                        <span className="admin-badge admin-badge-success">Udgivet</span>
                      ) : (
                        <span className="admin-badge admin-badge-warning">Kladde</span>
                      )}
                    </td>
                    <td className="text-slate-400 text-sm">
                      {formatAdminDateTime(doc.updatedAt)}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingDocument(doc)}
                          className="admin-btn admin-btn-ghost text-sky-400 px-2 py-1 text-sm whitespace-nowrap"
                        >
                          Rediger
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="admin-btn admin-btn-ghost text-red-400 px-2 py-1 text-sm whitespace-nowrap"
                        >
                          Slet
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FlightSchoolDocumentList;
