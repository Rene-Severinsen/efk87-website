import React from "react";
import "./AdminDashboard.css";

const AdminActivityStream: React.FC = () => {
  const activities = [
    { id: 1, text: "Jens Jensen rettede 'Om klubben' siden", time: "2 timer siden" },
    { id: 2, text: "Ny tilmelding til flyveskolen: Anders Andersen", time: "4 timer siden" },
    { id: 3, text: "Systemopdatering gennemført", time: "I går" },
  ];

  return (
    <div className="admin-card">
      <h2 className="admin-section-title">Aktivitetsstrøm</h2>
      <ul className="admin-activity-list">
        {activities.map((activity) => (
          <li key={activity.id} className="admin-activity-item">
            <span className="admin-activity-time">{activity.time}</span>
            <span className="admin-activity-text">{activity.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminActivityStream;
