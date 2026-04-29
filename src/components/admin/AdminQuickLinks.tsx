import React from "react";
import "./AdminDashboard.css";

interface AdminQuickLinksProps {
  clubSlug: string;
}

const AdminQuickLinks: React.FC<AdminQuickLinksProps> = ({ clubSlug }) => {
  return (
    <div className="admin-card" style={{ marginTop: "24px" }}>
      <h2 className="admin-section-title">Hurtige genveje</h2>
      <div className="admin-quick-links">
        <a href={`/${clubSlug}/admin/members`} className="admin-quick-link">
          Administrer medlemmer
        </a>
        <a href={`/${clubSlug}/admin/articles/new`} className="admin-quick-link">
          Skriv ny artikel
        </a>
        <a href={`/${clubSlug}/admin/settings`} className="admin-quick-link">
          Rediger klubindstillinger
        </a>
      </div>
    </div>
  );
};

export default AdminQuickLinks;
