import React from 'react';
import { ThemedSectionCard } from '../publicSite/ThemedBuildingBlocks';

interface ProfileDetailsPanelProps {
  firstName: string;
  lastName: string;
  email: string;
  mobilePhone?: string;
  addressLine?: string;
  postalCode?: string;
  city?: string;
}

export const ProfileDetailsPanel: React.FC<ProfileDetailsPanelProps> = ({ 
  firstName, 
  lastName, 
  email,
  mobilePhone,
  addressLine,
  postalCode,
  city
}) => {
  return (
    <ThemedSectionCard>
      <div className="section-head">
        <h2>Personlige oplysninger</h2>
      </div>

      <div className="profile-form-grid">
        <div className="profile-field">
          <label>Fornavn</label>
          <input type="text" value={firstName} readOnly />
        </div>
        <div className="profile-field">
          <label>Efternavn</label>
          <input type="text" value={lastName} readOnly />
        </div>

        <div className="profile-field">
          <label>E-mail</label>
          <input type="email" value={email} readOnly />
        </div>
        <div className="profile-field">
          <label>Mobilnummer</label>
          <input type="text" value={mobilePhone || ''} placeholder="Ikke oplyst" readOnly />
        </div>

        <div className="profile-field full">
          <label>Adresse</label>
          <input type="text" value={addressLine || ''} placeholder="Ikke oplyst" readOnly />
        </div>

        <div className="profile-field">
          <label>Postnummer</label>
          <input type="text" value={postalCode || ''} placeholder="0000" readOnly />
        </div>
        <div className="profile-field">
          <label>By</label>
          <input type="text" value={city || ''} placeholder="By" readOnly />
        </div>
      </div>

      <div className="profile-submit-row">
        <div className="small" style={{ fontSize: '13px', color: 'var(--club-muted)', maxWidth: '400px' }}>
          Kontakt en administrator hvis dine personlige oplysninger skal ændres.
        </div>
      </div>
    </ThemedSectionCard>
  );
};
