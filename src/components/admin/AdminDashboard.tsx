import React from "react";
import AdminHero from "./AdminHero";
import AdminMetricGrid from "./AdminMetricGrid";
import AdminActionTable from "./AdminActionTable";
import AdminActivityStream from "./AdminActivityStream";
import AdminQuickLinks from "./AdminQuickLinks";
import "./AdminDashboard.css";

interface AdminDashboardProps {
  clubSlug: string;
  clubName: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ clubSlug, clubName }) => {
  return (
    <div className="admin-dashboard">
      <AdminHero clubName={clubName} />
      <AdminMetricGrid />
      <div className="admin-dashboard-grid">
        <div className="admin-dashboard-main">
          <AdminActionTable />
        </div>
        <div className="admin-dashboard-side">
          <AdminActivityStream />
          <AdminQuickLinks clubSlug={clubSlug} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
