import React from "react";
import Avatar from "../../shared/Avatar";

interface Instructor {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

interface InstructorsPanelProps {
  instructors: Instructor[];
}

const InstructorsPanel: React.FC<InstructorsPanelProps> = ({ instructors }) => {
  return (
    <div className="admin-card">
      <h3 className="admin-section-title">Instruktører</h3>
      <p className="admin-form-help mb-4">
        Disse instruktører er aktive i klubben. De kan administreres under{" "}
        <a href="../admin/medlemmer" className="admin-link">
          Admin → Medlemmer
        </a>{" "}
        ved at markere dem som instruktør i deres profil.
      </p>

      {instructors.length === 0 ? (
        <p className="admin-form-help italic">Ingen aktive instruktører fundet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {instructors.map((instructor) => {
            const displayName = [instructor.firstName, instructor.lastName]
              .filter(Boolean)
              .join(" ")
              .trim();

            return (
              <div
                key={instructor.id}
                className="admin-list-card flex items-center gap-3"
              >
                <Avatar
                  imageUrl={instructor.profileImageUrl}
                  name={displayName || "Instruktør"}
                  size="md"
                />
                <div>
                  <div className="admin-strong font-medium">
                    {displayName || "Instruktør"}
                  </div>
                  <div className="admin-muted text-xs">Instruktør</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InstructorsPanel;
