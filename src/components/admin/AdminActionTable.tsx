import React from "react";
import "./AdminDashboard.css";

const AdminActionTable: React.FC = () => {
  const actions = [
    { id: 1, type: "Indmeldelse", subject: "Hans Hansen", status: "Venter", date: "2026-04-28" },
    { id: 2, type: "Moderation", subject: "Galleri billede #123", status: "Venter", date: "2026-04-29" },
    { id: 3, type: "Flyvemelding", subject: "Elev: Peter Jensen", status: "Gennemført", date: "2026-04-29" },
  ];

  return (
    <div className="admin-card">
      <h2 className="admin-section-title">Handlinger i dag</h2>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Emne</th>
              <th>Status</th>
              <th>Dato</th>
            </tr>
          </thead>
          <tbody>
            {actions.map((action) => (
              <tr key={action.id}>
                <td>{action.type}</td>
                <td>{action.subject}</td>
                <td>{action.status}</td>
                <td>{action.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminActionTable;
