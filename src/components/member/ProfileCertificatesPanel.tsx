import React from 'react';
import { ThemedSectionCard } from '../publicSite/ThemedBuildingBlocks';
import { ClubMemberCertificateType } from '@/generated/prisma';

interface ProfileCertificatesPanelProps {
  certificates?: ClubMemberCertificateType[];
}

const CertItem = ({ type, label, certificates }: { type: ClubMemberCertificateType, label: string, certificates: ClubMemberCertificateType[] }) => {
  const hasCert = certificates.includes(type);
  return (
    <div className="cert-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--club-line)' }}>
      <span>{label}</span>
      {hasCert ? (
        <span style={{ color: 'var(--club-accent)', fontSize: '12px', fontWeight: 'bold' }}>✓ AKTIV</span>
      ) : (
        <span style={{ opacity: 0.3, fontSize: '12px' }}>—</span>
      )}
    </div>
  );
};

export const ProfileCertificatesPanel: React.FC<ProfileCertificatesPanelProps> = ({ certificates = [] }) => {
  return (
    <ThemedSectionCard>
      <div className="section-head">
        <h2>Certifikater</h2>
      </div>

      <div className="cert-grid">
        <div className="cert-card">
          <h4>A-kategori</h4>
          <CertItem type="A_CERTIFICATE" label="A-certifikat" certificates={certificates} />
          <CertItem type="A_CONTROLLER" label="A-kontrollant" certificates={certificates} />
          <CertItem type="A_LARGE_MODEL" label="A-stormodel" certificates={certificates} />
          <CertItem type="A_LARGE_MODEL_CONTROLLER" label="A-stormodel kontrollant" certificates={certificates} />
        </div>

        <div className="cert-card">
          <h4>S-kategori</h4>
          <CertItem type="S_CERTIFICATE" label="S-certifikat" certificates={certificates} />
          <CertItem type="S_CONTROLLER" label="S-kontrollant" certificates={certificates} />
          <CertItem type="S_LARGE_MODEL" label="S-stormodel" certificates={certificates} />
          <CertItem type="S_LARGE_MODEL_CONTROLLER" label="S-stormodel kontrollant" certificates={certificates} />
        </div>

        <div className="cert-card">
          <h4>H-kategori</h4>
          <CertItem type="H_CERTIFICATE" label="H-certifikat" certificates={certificates} />
          <CertItem type="H_CONTROLLER" label="H-kontrollant" certificates={certificates} />
          <CertItem type="H_LARGE_MODEL" label="H-stormodel" certificates={certificates} />
          <CertItem type="H_LARGE_MODEL_CONTROLLER" label="H-stormodel kontrollant" certificates={certificates} />
        </div>

        <div className="cert-card">
          <h4>J-kategori</h4>
          <CertItem type="J_LARGE_MODEL" label="J-stormodel" certificates={certificates} />
          <CertItem type="J_LARGE_MODEL_CONTROLLER" label="J-stormodel kontrollant" certificates={certificates} />
        </div>
      </div>
    </ThemedSectionCard>
  );
};
