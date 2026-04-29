import React from 'react';
import { ThemedSectionCard } from '../publicSite/ThemedBuildingBlocks';

interface ProfileSummaryCardProps {
  name: string;
  role: string;
  status: string;
}

export const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({ name, role, status }) => {
  // Generate initials for the avatar placeholder
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <ThemedSectionCard className="profile-box">
        <div className="avatar-wrap">
          <div className="avatar">
            {/* Using initials as placeholder as per requirement */}
            <span style={{ color: 'var(--club-text)' }}>{initials}</span>
          </div>
          <div className="upload-chip">Upload billede</div>
        </div>

        <h3>{name}</h3>
        <p className="small" style={{ fontSize: '13px', color: 'var(--club-muted)' }}>
          {status} · {role}
        </p>

        <div className="meta-row">
          <span className="meta-chip">A-certifikat</span>
          <span className="meta-chip">S-kontrollant</span>
          <span className="meta-chip">3 mailinglister</span>
        </div>
      </ThemedSectionCard>

      <ThemedSectionCard>
        <div className="section-head">
          <h2>Profilbillede</h2>
          <span className="link-soft" style={{ opacity: 0.5, cursor: 'default' }}>Skift billede</span>
        </div>

        <div className="info-list">
          <div className="info-item">
            <h4>Upload af profilbillede</h4>
            <p>Brugeren skal kunne vælge, uploade og udskifte sit profilbillede direkte fra profilsiden. Billedet vises på medlemsprofilen og kan senere bruges i medlemsoversigt og forum.</p>
          </div>
          <div className="info-item">
            <h4>Anbefalet format</h4>
            <p>Portræt billede med god beskæring. Systemet bør håndtere resize og evt. beskæring ved upload.</p>
          </div>
        </div>
      </ThemedSectionCard>

      <ThemedSectionCard>
        <div className="section-head">
          <h2>Adgang og sikkerhed</h2>
          <span className="link-soft" style={{ opacity: 0.5, cursor: 'default' }}>Skift password</span>
        </div>
        <div className="profile-list">
          <div className="profile-list-item">
            <h4>Password</h4>
            <p>Brugeren kan skifte password direkte fra profilsiden. Flow bør være enkelt og sikkert med bekræftelse og klare fejlbeskeder.</p>
          </div>
          <div className="profile-list-item">
            <h4>Seneste login</h4>
            <p>Ikke tilgængelig i v1.</p>
          </div>
        </div>
      </ThemedSectionCard>
    </>
  );
};
