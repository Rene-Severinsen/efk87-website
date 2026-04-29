import React from "react";
import "./AdminDashboard.css";

interface AdminHeroProps {
  clubName: string;
}

const AdminHero: React.FC<AdminHeroProps> = ({ clubName }) => {
  return (
    <div className="admin-hero">
      <h1 className="admin-hero-title">Velkommen til {clubName} Admin</h1>
      <p className="admin-hero-subtitle">
        Her kan du administrere medlemmer, indhold og klubbens daglige drift.
      </p>
    </div>
  );
};

export default AdminHero;
