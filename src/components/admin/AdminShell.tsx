import React from "react";
import AdminSidebar from "./AdminSidebar";
import "./AdminDashboard.css";

interface AdminShellProps {
  clubSlug: string;
  clubName: string;
  userName: string;
  children: React.ReactNode;
}

const AdminShell: React.FC<AdminShellProps> = ({
  clubSlug,
  clubName,
  userName,
  children,
}) => {
  return (
    <div className="admin-shell">
      <AdminSidebar clubSlug={clubSlug} />
      <main className="admin-main-content">
        <header className="admin-topbar">
          <div className="admin-topbar-title">
            {clubName} Admin
          </div>
          <div className="admin-topbar-actions">
            <span style={{ marginRight: "16px", fontSize: "0.875rem", color: "#8c8c8c" }}>
              Logget ind som: <strong>{userName}</strong>
            </span>
            <a href={`/${clubSlug}`} className="admin-btn">
              Se medlemssite
            </a>
            <a href={`/${clubSlug}`} className="admin-btn">
              Åbn public site
            </a>
            <button className="admin-btn admin-btn-primary">
              Opret ny artikel
            </button>
          </div>
        </header>
        <div className="admin-workspace">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminShell;
