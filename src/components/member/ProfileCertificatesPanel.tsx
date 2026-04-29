import React from 'react';
import { ThemedSectionCard } from '../publicSite/ThemedBuildingBlocks';
import { ClubMemberCertificateType } from '@/generated/prisma';

interface ProfileCertificatesPanelProps {
  certificates?: ClubMemberCertificateType[];
}

const getCertLabel = (type: ClubMemberCertificateType) => {
  switch (type) {
    case 'A_CERTIFICATE': return 'A-certifikat';
    case 'A_CONTROLLER': return 'A-kontrollant';
    case 'A_LARGE_MODEL': return 'A-stormodel';
    case 'A_LARGE_MODEL_CONTROLLER': return 'A-stormodel kontrollant';
    case 'S_CERTIFICATE': return 'S-certifikat';
    case 'S_CONTROLLER': return 'S-kontrollant';
    case 'S_LARGE_MODEL': return 'S-stormodel';
    case 'S_LARGE_MODEL_CONTROLLER': return 'S-stormodel kontrollant';
    case 'H_CERTIFICATE': return 'H-certifikat';
    case 'H_CONTROLLER': return 'H-kontrollant';
    case 'H_LARGE_MODEL': return 'H-stormodel';
    case 'H_LARGE_MODEL_CONTROLLER': return 'H-stormodel kontrollant';
    case 'J_LARGE_MODEL': return 'J-stormodel';
    case 'J_LARGE_MODEL_CONTROLLER': return 'J-stormodel kontrollant';
    default: return (type as string).replace(/_/g, ' ').replace('CERTIFICATE', 'certifikat');
  }
};

export const ProfileCertificatesPanel: React.FC<ProfileCertificatesPanelProps> = ({ certificates = [] }) => {
  if (certificates.length === 0) {
    return (
      <ThemedSectionCard>
        <div className="section-head">
          <h2>Certifikater</h2>
        </div>
        <p style={{ opacity: 0.5, fontStyle: 'italic', padding: '12px 0' }}>
          Ingen certifikater registreret.
        </p>
      </ThemedSectionCard>
    );
  }

  return (
    <ThemedSectionCard>
      <div className="section-head">
        <h2>Certifikater</h2>
      </div>

      <div className="cert-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {certificates.map((cert) => (
          <div key={cert} className="cert-item" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '12px 0', 
            borderBottom: '1px solid var(--club-line)' 
          }}>
            <span style={{ fontWeight: 500 }}>{getCertLabel(cert)}</span>
            <span style={{ color: 'var(--club-accent)', fontSize: '12px', fontWeight: 'bold' }}>✓ AKTIV</span>
          </div>
        ))}
      </div>
    </ThemedSectionCard>
  );
};
