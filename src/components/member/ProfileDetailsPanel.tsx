import React from 'react';
import { ThemedSectionCard } from '../publicSite/ThemedBuildingBlocks';

import { SCHOOL_STATUS_LABELS } from '@/lib/members/memberConstants';
import { ClubMemberSchoolStatus } from '@/generated/prisma';

interface ProfileDetailsPanelProps {
  firstName: string;
  lastName: string;
  email: string;
  mobilePhone?: string;
  addressLine?: string;
  postalCode?: string;
  city?: string;
  memberNumber?: number | null;
  mdkNumber?: string;
  birthDate?: Date | null;
  joinedAt?: Date | null;
  schoolStatus?: string;
  isInstructor?: boolean;
}

export const ProfileDetailsPanel: React.FC<ProfileDetailsPanelProps> = ({ 
  firstName, 
  lastName, 
  email,
  mobilePhone,
  addressLine,
  postalCode,
  city,
  memberNumber,
  mdkNumber,
  birthDate,
  joinedAt,
  schoolStatus,
  isInstructor
}) => {
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Ikke oplyst';
    return new Date(date).toLocaleDateString('da-DK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getSchoolStatusLabel = (status?: string) => {
    if (!status) return 'Ikke oplyst';
    return SCHOOL_STATUS_LABELS[status as ClubMemberSchoolStatus] || status;
  };

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

        <div className="profile-field">
          <label>Medlemsnummer</label>
          <input type="text" value={memberNumber || ''} placeholder="Ikke oplyst" readOnly />
        </div>
        <div className="profile-field">
          <label>MDK-nummer</label>
          <input type="text" value={mdkNumber || ''} placeholder="Ikke oplyst" readOnly />
        </div>

        <div className="profile-field">
          <label>Fødselsdato</label>
          <input type="text" value={formatDate(birthDate)} readOnly />
        </div>
        <div className="profile-field">
          <label>Indmeldt dato</label>
          <input type="text" value={formatDate(joinedAt)} readOnly />
        </div>

        <div className="profile-field">
          <label>Skolestatus</label>
          <input type="text" value={getSchoolStatusLabel(schoolStatus)} readOnly />
        </div>
        <div className="profile-field">
          <label>Instruktør</label>
          <input type="text" value={isInstructor ? 'Ja' : 'Nej'} readOnly />
        </div>
      </div>

    </ThemedSectionCard>
  );
};
