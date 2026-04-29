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
            href={`/${clubSlug}/admin/handlinger-i-dag`} 
            className={`admin-sidebar-item ${pathname === `/${clubSlug}/admin/handlinger-i-dag` ? "active" : ""}`}
          >
            Handlinger i dag
          </a>
          <a 
            href={`/${clubSlug}/admin/systemstatus`} 
            className={`admin-sidebar-item ${pathname === `/${clubSlug}/admin/systemstatus` ? "active" : ""}`}
          >
            Systemstatus
          </a>
        </div>

        <div className="admin-sidebar-group">
          <div className="admin-sidebar-group-title">Klubdrift</div>
          <a 
            href={`/${clubSlug}/admin/medlemmer`} 
            className={`admin-sidebar-item ${pathname === `/${clubSlug}/admin/medlemmer` ? "active" : ""}`}
          >
            Medlemmer
          </a>
          <a 
            href={`/${clubSlug}/admin/flyveskole`} 
            className={`admin-sidebar-item ${pathname === `/${clubSlug}/admin/flyveskole` ? "active" : ""}`}
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
            href={`/${clubSlug}/admin/mailinglister`} 
            className={`admin-sidebar-item ${pathname === `/${clubSlug}/admin/mailinglister` ? "active" : ""}`}
          >
            Mailinglister
          </a>
        </div>

        <div className="admin-sidebar-group">
          <div className="admin-sidebar-group-title">Indhold</div>
          <a 
            href={`/${clubSlug}/admin/forsideindhold`} 
            className={`admin-sidebar-item ${pathname === `/${clubSlug}/admin/forsideindhold` ? "active" : ""}`}
          >
            Forsideindhold
          </a>
          <a 
            href={`/${clubSlug}/admin/artikler`} 
            className={`admin-sidebar-item ${pathname?.startsWith(`/${clubSlug}/admin/artikler`) ? "active" : ""}`}
          >
            Artikler
          </a>
          <a 
            href={`/${clubSlug}/admin/kalender`} 
            className={`admin-sidebar-item ${pathname?.startsWith(`/${clubSlug}/admin/kalender`) ? "active" : ""}`}
          >
            Kalender
          </a>
          <a 
            href={`/${clubSlug}/admin/forum`} 
            className={`admin-sidebar-item ${pathname === `/${clubSlug}/admin/forum` ? "active" : ""}`}
          >
            Forum
          </a>
          <a 
            href={`/${clubSlug}/admin/galleri`} 
            className={`admin-sidebar-item ${pathname === `/${clubSlug}/admin/galleri` ? "active" : ""}`}
          >
            Galleri
          </a>
        </div>

        <div className="admin-sidebar-group">
          <div className="admin-sidebar-group-title">Platform</div>
          <a 
            href={`/${clubSlug}/admin/statistik`} 
            className={`admin-sidebar-item ${pathname === `/${clubSlug}/admin/statistik` ? "active" : ""}`}
          >
            Statistik
          </a>
          <a 
            href={`/${clubSlug}/admin/eksport`} 
            className={`admin-sidebar-item ${pathname === `/${clubSlug}/admin/eksport` ? "active" : ""}`}
          >
            Eksport
          </a>
          <a 
            href={`/${clubSlug}/admin/site-settings`} 
            className={`admin-sidebar-item ${pathname === `/${clubSlug}/admin/site-settings` ? "active" : ""}`}
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
