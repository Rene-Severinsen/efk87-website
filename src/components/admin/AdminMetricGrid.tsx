import React from "react";
import "./AdminDashboard.css";

const AdminMetricGrid: React.FC = () => {
  const metrics = [
    { label: "Medlemmer", value: "124" },
    { label: "Flyveskole elever", value: "12" },
    { label: "Flyvemeldinger i dag", value: "8" },
    { label: "Systemstatus", value: "OK" },
  ];

  return (
    <div className="admin-metric-grid">
      {metrics.map((metric, index) => (
        <div key={index} className="admin-card admin-metric-card">
          <span className="admin-metric-label">{metric.label}</span>
          <span className="admin-metric-value">{metric.value}</span>
        </div>
      ))}
    </div>
  );
};

export default AdminMetricGrid;
