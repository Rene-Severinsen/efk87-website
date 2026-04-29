import React from 'react';

export const MemberCardReference: React.FC = () => {
  return (
    <div className="member-card-reference">
      <h2>Det færdige medlemsbevis</h2>
      <div className="reference-placeholder">
        {/* Placeholder for legacy image asset */}
        <div style={{ textAlign: 'center' }}>
          <p>TODO: Indsæt referencebillede af det færdige medlemsbevis</p>
          <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>(Legacy image asset pending)</p>
        </div>
      </div>
    </div>
  );
};
