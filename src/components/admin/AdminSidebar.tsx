"use client";

import React from "react";
import { usePathname } from "next/navigation";
import "./AdminDashboard.css";
import { logoutAction } from "../../lib/auth/logout";

interface AdminSidebarProps {
  clubSlug: string;
  userName?: string;
  userRole?: string;
  userEmail?: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  clubSlug, 
  userName, 
  userRole, 
  userEmail 
}) => {
  const pathname = usePathname();
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logoutAction(clubSlug);
  };

  const userInitial = (userName || "A").charAt(0).toUpperCase();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">EFK87 Admin</div>
      <nav className="admin-sidebar-nav">
        <div className="admin-sidebar-group">
          <div className="admin-sidebar-group-title">Overblik</div>
          <a 
            href={`/${clubSlug}/admin`} 
            className={`admin-sidebar-item ${pathname === `/${clubSlug}/admin` ? "active" : ""}`}
          >
            Forside
          </a>
          <a 
            href={`/${clubSlug}/admin/actions`} 
            className={`admin-sidebar-item ${pathname === `/${clubSlug}/admin/actions` ? "active" : ""}`}
          >
            Handlinger i dag
          </a>
          <a 
            href={`/${clubSlug}/admin/status`} 
            className={`admin-sidebar-item ${pathname === `/${clubSlug}/admin/status` ? "active" : ""}`}
          >
            Systemstatus
          </a>
        </div>

        <div className="admin-sidebar-group">
          <div className="admin-sidebar-group-title">Klubdrift</div>
          <a 
            href={`/${clubSlug}/admin/members`} 
            className={`admin-sidebar-item ${pathname === `/${clubSlug}/admin/members` ? "active" : ""}`}
          >
            Medlemmer
          </a>
          <a 
            href={`/${clubSlug}/admin/flightschool`} 
            className={`admin-sidebar-item ${pathname === `/${clubSlug}/admin/flightschool` ? "active" : ""}`}
          >
            Flyveskole
          </a>
          <a 
            href={`/${clubSlug}/admin/flyvemeldinger`} 
            className={`admin-sidebar-item ${pathname === `/${clubSlug}/admin/flyvemeldinger` ? "active" : ""}`}
          >
            Flyvemeldinger
          </a>
          <a 
            href={`/${clubSlug}/admin/mailinglists`} 
            className={`admin-sidebar-item ${pathname === `/${clubSlug}/admin/mailinglists` ? "active" : ""}`}
          >
            Mailinglister
          </a>
        </div>

        <div className="admin-sidebar-group">
          <div className="admin-sidebar-group-title">Indhold</div>
          <a 
            href={`/${clubSlug}/admin/home-content`} 
            className={`admin-sidebar-item ${pathname === `/${clubSlug}/admin/home-content` ? "active" : ""}`}
          >
            Forsideindhold
          </a>
          <a 
            href={`/${clubSlug}/admin/articles`} 
            className={`admin-sidebar-item ${pathname === `/${clubSlug}/admin/articles` ? "active" : ""}`}
          >
            Artikler
          </a>
          <a 
            href={`/${clubSlug}/admin/forum`} 
            className={`admin-sidebar-item ${pathname === `/${clubSlug}/admin/forum` ? "active" : ""}`}
          >
            Forum
          </a>
          <a 
            href={`/${clubSlug}/admin/gallery`} 
            className={`admin-sidebar-item ${pathname === `/${clubSlug}/admin/gallery` ? "active" : ""}`}
          >
            Galleri
          </a>
        </div>

        <div className="admin-sidebar-group">
          <div className="admin-sidebar-group-title">Platform</div>
          <a 
            href={`/${clubSlug}/admin/stats`} 
            className={`admin-sidebar-item ${pathname === `/${clubSlug}/admin/stats` ? "active" : ""}`}
          >
            Statistik
          </a>
          <a 
            href={`/${clubSlug}/admin/export`} 
            className={`admin-sidebar-item ${pathname === `/${clubSlug}/admin/export` ? "active" : ""}`}
          >
            Eksport
          </a>
          <a 
            href={`/${clubSlug}/admin/settings`} 
            className={`admin-sidebar-item ${pathname === `/${clubSlug}/admin/settings` ? "active" : ""}`}
          >
            Site settings
          </a>
        </div>
      </nav>
      
      <div className="admin-sidebar-footer">
        <div className="admin-user-card">
          <div className="admin-user-card-main">
            <div className="admin-user-avatar">
              {userInitial}
            </div>
            <div className="admin-user-info">
              <div className="admin-user-name">{userName || "Admin"}</div>
              <div className="admin-user-role">
                {userRole || "Administrator"}
              </div>
              {userEmail && <div className="admin-user-email">{userEmail}</div>}
            </div>
          </div>
          <div className="admin-user-actions">
            <button 
              onClick={handleLogout}
              className="admin-user-action admin-user-action-logout"
            >
              Log ud
            </button>
          </div>
        </div>
        <div className="admin-sidebar-copyright">
          © 2026 EFK87 Platform
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
