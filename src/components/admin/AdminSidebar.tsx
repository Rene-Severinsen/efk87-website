import React from "react";
import "./AdminDashboard.css";

interface AdminSidebarProps {
  clubSlug: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ clubSlug }) => {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">EFK87 Admin</div>
      <nav className="admin-sidebar-nav">
        <div className="admin-sidebar-group">
          <div className="admin-sidebar-group-title">Overblik</div>
          <a href={`/${clubSlug}/admin`} className="admin-sidebar-item active">
            Forside
          </a>
          <a href={`/${clubSlug}/admin/actions`} className="admin-sidebar-item">
            Handlinger i dag
          </a>
          <a href={`/${clubSlug}/admin/status`} className="admin-sidebar-item">
            Systemstatus
          </a>
        </div>

        <div className="admin-sidebar-group">
          <div className="admin-sidebar-group-title">Klubdrift</div>
          <a href={`/${clubSlug}/admin/members`} className="admin-sidebar-item">
            Medlemmer
          </a>
          <a href={`/${clubSlug}/admin/flightschool`} className="admin-sidebar-item">
            Flyveskole
          </a>
          <a href={`/${clubSlug}/admin/flightintents`} className="admin-sidebar-item">
            Flyvemeldinger
          </a>
          <a href={`/${clubSlug}/admin/mailinglists`} className="admin-sidebar-item">
            Mailinglister
          </a>
        </div>

        <div className="admin-sidebar-group">
          <div className="admin-sidebar-group-title">Indhold</div>
          <a href={`/${clubSlug}/admin/home-content`} className="admin-sidebar-item">
            Forsideindhold
          </a>
          <a href={`/${clubSlug}/admin/articles`} className="admin-sidebar-item">
            Artikler
          </a>
          <a href={`/${clubSlug}/admin/forum`} className="admin-sidebar-item">
            Forum
          </a>
          <a href={`/${clubSlug}/admin/gallery`} className="admin-sidebar-item">
            Galleri
          </a>
        </div>

        <div className="admin-sidebar-group">
          <div className="admin-sidebar-group-title">Platform</div>
          <a href={`/${clubSlug}/admin/stats`} className="admin-sidebar-item">
            Statistik
          </a>
          <a href={`/${clubSlug}/admin/export`} className="admin-sidebar-item">
            Eksport
          </a>
          <a href={`/${clubSlug}/admin/settings`} className="admin-sidebar-item">
            Site settings
          </a>
        </div>
      </nav>
      <div className="admin-footer">
        © 2026 EFK87 Platform
      </div>
    </aside>
  );
};

export default AdminSidebar;
