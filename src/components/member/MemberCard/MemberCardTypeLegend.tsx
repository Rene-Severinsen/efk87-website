import React from 'react';

export const MemberCardTypeLegend: React.FC = () => {
  return (
    <div className="member-card-legend">
      <h2>Kort typer</h2>
      <div className="legend-list">
        <div className="legend-item">
          <div className="legend-preview preview-plads">Plads godkendt</div>
          <span>Plads godkendt kort, må flyve.</span>
        </div>
        <div className="legend-item">
          <div className="legend-preview preview-elev">Elev</div>
          <span>Elev kort, må kun flyve under overvågning af instruktør / bestyrelsesmedlem.</span>
        </div>
        <div className="legend-item">
          <div className="legend-preview preview-passiv">Passiv</div>
          <span>Passiv kort, må ikke flyve.</span>
        </div>
      </div>
    </div>
  );
};
