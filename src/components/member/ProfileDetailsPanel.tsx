import React from 'react';
import { ThemedSectionCard } from '../publicSite/ThemedBuildingBlocks';

interface ProfileDetailsPanelProps {
  firstName: string;
  lastName: string;
  email: string;
}

export const ProfileDetailsPanel: React.FC<ProfileDetailsPanelProps> = ({ firstName, lastName, email }) => {
  return (
    <ThemedSectionCard>
      <div className="section-head">
        <h2>Personlige oplysninger</h2>
        <span>Redigér egne data</span>
      </div>

      <div className="profile-form-grid">
        <div className="profile-field">
          <label>Fornavn</label>
          <input type="text" defaultValue={firstName} readOnly />
        </div>
        <div className="profile-field">
          <label>Efternavn</label>
          <input type="text" defaultValue={lastName} readOnly />
        </div>

        <div className="profile-field">
          <label>E-mail</label>
          <input type="email" defaultValue={email} readOnly />
        </div>
        <div className="profile-field">
          <label>Mobilnummer</label>
          <input type="text" placeholder="+45 00 00 00 00" readOnly />
        </div>

        <div className="profile-field full">
          <label>Adresse</label>
          <input type="text" placeholder="Gadenavn 1, st. tv" readOnly />
        </div>

        <div className="profile-field">
          <label>Postnummer</label>
          <input type="text" placeholder="0000" readOnly />
        </div>
        <div className="profile-field">
          <label>By</label>
          <input type="text" placeholder="By" readOnly />
        </div>
      </div>

      <div className="profile-submit-row">
        <div className="small" style={{ fontSize: '13px', color: 'var(--club-muted)', maxWidth: '400px' }}>
          Ændringer på profilen gemmes på dit medlemskort og bruges i klubbens medlemsportal.
        </div>
        <div className="actions" style={{ display: 'flex', gap: '10px' }}>
          <span className="pill disabled">Annullér</span>
          <span className="pill primary disabled">Gem oplysninger</span>
        </div>
      </div>
    </ThemedSectionCard>
  );
};
