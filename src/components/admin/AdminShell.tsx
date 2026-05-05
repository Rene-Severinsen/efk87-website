import React from "react";
import AdminSidebar from "./AdminSidebar";
import "./AdminDashboard.css";

interface AdminShellProps {
  clubSlug: string;
  clubName: string;
  userName: string;
  userRole?: string;
  userEmail?: string;
  children: React.ReactNode;
}

const AdminShell: React.FC<AdminShellProps> = ({
  clubSlug,
  clubName,
  userName,
  userRole,
  userEmail,
  children,
}) => {
  return (
    <div className="admin-shell">
      <AdminSidebar
        clubSlug={clubSlug}
        userName={userName}
        userRole={userRole}
        userEmail={userEmail}
      />

      <main className="admin-main-content">
        <header className="admin-topbar">
          <div className="admin-topbar-title">
            {clubName} Admin
          </div>

          <div className="admin-topbar-actions">
            <a href={`/${clubSlug}`} className="admin-btn admin-btn-ghost">
              Åbn hjemmeside
            </a>
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
