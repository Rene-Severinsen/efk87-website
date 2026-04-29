import React from 'react';
import './MemberCardPrint.css';

interface PrintableMemberCardProps {
  name: string;
  year: number;
  memberNumber?: number | null;
  status: 'plads' | 'elev' | 'passiv' | 'fallback';
}

export const PrintableMemberCard: React.FC<PrintableMemberCardProps> = ({ 
  name, 
  year, 
  memberNumber,
  status
}) => {
  const getStatusClass = () => {
    switch (status) {
      case 'plads': return 'status-plads';
      case 'elev': return 'status-elev';
      case 'passiv': return 'status-passiv';
      default: return '';
    }
  };

  return (
    <div className="printable-member-card-container">
      <div className={`printable-member-card ${getStatusClass()}`}>
        <div className="card-top">
          <div className="card-name">
            {name.split(' ').map((part, index) => (
              <React.Fragment key={index}>
                {part}
                {index === 0 && name.split(' ').length > 1 ? <br /> : ' '}
              </React.Fragment>
            ))}
          </div>
          <div className="card-year">{year}</div>
        </div>
        
        <div className="card-logo-container">
          <div className="card-logo-placeholder">
            EFK87<br />LOGO
          </div>
        </div>

        <div className="card-footer">
          {memberNumber && <span>Medlemsnr. {memberNumber}</span>}
          <span style={{ marginLeft: 'auto' }}>EFK87</span>
        </div>
      </div>
    </div>
  );
};
