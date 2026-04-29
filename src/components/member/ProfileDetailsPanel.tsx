"use client";

import React, { useState, useActionState } from 'react';
import { ThemedSectionCard } from '../publicSite/ThemedBuildingBlocks';

import { SCHOOL_STATUS_LABELS } from '@/lib/members/memberConstants';
import { ClubMemberSchoolStatus } from '@/generated/prisma';
import { updateOwnMemberProfileAction } from '@/lib/members/memberActions';

interface ProfileDetailsPanelProps {
  clubId: string;
  clubSlug: string;
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
  clubId,
  clubSlug,
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
  const [isEditing, setIsEditing] = useState(false);
  const updateAction = updateOwnMemberProfileAction.bind(null, clubId, clubSlug);
  const [state, action, isPending] = useActionState(updateAction, null);

  // Sync isEditing with successful state
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    if (state?.success) {
      setIsEditing(false);
    }
  }

  const formatDateForDisplay = (date: Date | null | undefined) => {
    if (!date) return 'Ikke oplyst';
    return new Date(date).toLocaleDateString('da-DK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateForInput = (date: Date | null | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const getSchoolStatusLabel = (status?: string) => {
    if (!status) return 'Ikke oplyst';
    return SCHOOL_STATUS_LABELS[status as ClubMemberSchoolStatus] || status;
  };

  return (
    <ThemedSectionCard>
      <div className="section-head">
        <h2>Personlige oplysninger</h2>
        {!isEditing && (
          <button 
            className="link-soft" 
            onClick={() => setIsEditing(true)}
            type="button"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Rediger
          </button>
        )}
      </div>

      <form action={action}>
        <div className="profile-form-grid">
          <div className="profile-field">
            <label htmlFor="firstName">Fornavn</label>
            <input 
              id="firstName"
              name="firstName"
              type="text" 
              defaultValue={firstName} 
              readOnly={!isEditing} 
              required={isEditing}
            />
            {state?.fieldErrors?.firstName && <span className="error-text">{state.fieldErrors.firstName}</span>}
          </div>
          <div className="profile-field">
            <label htmlFor="lastName">Efternavn</label>
            <input 
              id="lastName"
              name="lastName"
              type="text" 
              defaultValue={lastName} 
              readOnly={!isEditing} 
              required={isEditing}
            />
            {state?.fieldErrors?.lastName && <span className="error-text">{state.fieldErrors.lastName}</span>}
          </div>

          <div className="profile-field">
            <label htmlFor="email">E-mail</label>
            <input 
              id="email"
              type="email" 
              value={email} 
              readOnly 
              className="read-only-field"
            />
          </div>
          <div className="profile-field">
            <label htmlFor="mobilePhone">Mobilnummer</label>
            <input 
              id="mobilePhone"
              name="mobilePhone"
              type="text" 
              defaultValue={mobilePhone || ''} 
              placeholder={isEditing ? "Mobilnummer" : "Ikke oplyst"} 
              readOnly={!isEditing} 
            />
          </div>

          <div className="profile-field full">
            <label htmlFor="addressLine">Adresse</label>
            <input 
              id="addressLine"
              name="addressLine"
              type="text" 
              defaultValue={addressLine || ''} 
              placeholder={isEditing ? "Adresse" : "Ikke oplyst"} 
              readOnly={!isEditing} 
            />
          </div>

          <div className="profile-field">
            <label htmlFor="postalCode">Postnummer</label>
            <input 
              id="postalCode"
              name="postalCode"
              type="text" 
              defaultValue={postalCode || ''} 
              placeholder={isEditing ? "0000" : "Ikke oplyst"} 
              readOnly={!isEditing} 
            />
          </div>
          <div className="profile-field">
            <label htmlFor="city">By</label>
            <input 
              id="city"
              name="city"
              type="text" 
              defaultValue={city || ''} 
              placeholder={isEditing ? "By" : "Ikke oplyst"} 
              readOnly={!isEditing} 
            />
          </div>

          <div className="profile-field">
            <label htmlFor="memberNumber">Medlemsnummer</label>
            <input 
              id="memberNumber"
              type="text" 
              value={memberNumber || ''} 
              placeholder="Ikke oplyst" 
              readOnly 
              className="read-only-field"
            />
          </div>
          <div className="profile-field">
            <label htmlFor="mdkNumber">MDK-nummer</label>
            <input 
              id="mdkNumber"
              name="mdkNumber"
              type="text" 
              defaultValue={mdkNumber || ''} 
              placeholder={isEditing ? "Ikke oplyst" : "Ikke oplyst"} 
              readOnly={!isEditing} 
            />
          </div>

          <div className="profile-field">
            <label htmlFor="birthDate">Fødselsdato</label>
            {isEditing ? (
              <input 
                id="birthDate"
                name="birthDate"
                type="date" 
                defaultValue={formatDateForInput(birthDate)} 
              />
            ) : (
              <input 
                id="birthDate"
                type="text" 
                value={formatDateForDisplay(birthDate)} 
                readOnly 
              />
            )}
          </div>
          <div className="profile-field">
            <label htmlFor="joinedAt">Indmeldt dato</label>
            <input 
              id="joinedAt"
              type="text" 
              value={formatDateForDisplay(joinedAt)} 
              readOnly 
              className="read-only-field"
            />
          </div>

          <div className="profile-field">
            <label htmlFor="schoolStatus">Skolestatus</label>
            <input 
              id="schoolStatus"
              type="text" 
              value={getSchoolStatusLabel(schoolStatus)} 
              readOnly 
              className="read-only-field"
            />
          </div>
          <div className="profile-field">
            <label htmlFor="isInstructor">Instruktør</label>
            <input 
              id="isInstructor"
              type="text" 
              value={isInstructor ? 'Ja' : 'Nej'} 
              readOnly 
              className="read-only-field"
            />
          </div>
        </div>

        {isEditing && (
          <div className="profile-submit-row">
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="submit" 
                className="pill primary" 
                disabled={isPending}
                style={{ cursor: 'pointer' }}
              >
                {isPending ? 'Gemmer...' : 'Gem ændringer'}
              </button>
              <button 
                type="button" 
                className="pill" 
                onClick={() => setIsEditing(false)}
                disabled={isPending}
                style={{ cursor: 'pointer' }}
              >
                Annuller
              </button>
            </div>
            {state?.error && <p className="error-text" style={{ color: '#ef4444', fontSize: '14px' }}>{state.error}</p>}
          </div>
        )}
        {state?.success && !isEditing && (
          <div className="profile-submit-row">
            <p style={{ color: '#10b981', fontSize: '14px', fontWeight: 600 }}>Oplysninger gemt!</p>
          </div>
        )}
      </form>

      <style jsx>{`
        .read-only-field {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .error-text {
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
        }
      `}</style>
    </ThemedSectionCard>
  );
};
