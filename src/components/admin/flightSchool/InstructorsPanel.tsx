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
        <a href="../admin/medlemmer" className="text-sky-400 hover:underline">
          Admin → Medlemmer
        </a>{" "}
        ved at markere dem som instruktør i deres profil.
      </p>

      {instructors.length === 0 ? (
        <p className="text-slate-400 italic">Ingen aktive instruktører fundet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {instructors.map((instructor) => (
            <div
              key={instructor.id}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10"
            >
              <Avatar 
                imageUrl={instructor.profileImageUrl} 
                name={`${instructor.firstName} ${instructor.lastName}`} 
                size="md"
              />
              <div>
                <div className="font-medium text-white">
                  {instructor.firstName} {instructor.lastName}
                </div>
                <div className="text-xs text-slate-400">Instruktør</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorsPanel;
