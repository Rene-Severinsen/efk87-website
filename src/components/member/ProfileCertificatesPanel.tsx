"use client";

import React, { useState, useTransition } from 'react';
import { ThemedSectionCard } from '../publicSite/ThemedBuildingBlocks';
import { ClubMemberCertificateType } from '@/generated/prisma';
import { ALL_CERTIFICATE_TYPES, CERTIFICATE_LABELS } from '@/lib/members/memberConstants';
import { updateOwnMemberCertificatesAction } from '@/lib/members/memberProfileActions';

interface ProfileCertificatesPanelProps {
  clubId: string;
  clubSlug: string;
  certificates?: ClubMemberCertificateType[];
}

export const ProfileCertificatesPanel: React.FC<ProfileCertificatesPanelProps> = ({
  clubId,
  clubSlug,
  certificates = [],
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCerts, setSelectedCerts] = useState<ClubMemberCertificateType[]>(certificates);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleToggleCert = (cert: ClubMemberCertificateType) => {
    setSelectedCerts((prev) =>
      prev.includes(cert)
        ? prev.filter((item) => item !== cert)
        : [...prev, cert]
    );
  };

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateOwnMemberCertificatesAction(clubId, clubSlug, selectedCerts);
      if (result.success) {
        setIsEditing(false);
      } else {
        setError(result.error || 'Kunne ikke gemme certifikater.');
      }
    });
  };

  const handleCancel = () => {
    setSelectedCerts(certificates);
    setIsEditing(false);
    setError(null);
  };

  return (
    <ThemedSectionCard>
      <div className="section-head">
        <h2>Certifikater</h2>
        {!isEditing ? (
          <button
            className="link-soft"
            onClick={() => setIsEditing(true)}
            type="button"
          >
            Rediger
          </button>
        ) : (
          <div className="profile-submit-actions">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              className="public-secondary-button"
            >
              Annuller
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="public-primary-button"
            >
              {isPending ? 'Gemmer...' : 'Gem'}
            </button>
          </div>
        )}
      </div>

      {error && <div className="profile-error-alert">{error}</div>}

      <div className="cert-list">
        {isEditing ? (
          <div className="cert-edit-grid">
            {ALL_CERTIFICATE_TYPES.map((cert) => {
              const isSelected = selectedCerts.includes(cert);
              return (
                <label
                  key={cert}
                  className={`cert-edit-option${isSelected ? ' is-selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleCert(cert)}
                  />
                  <span>{CERTIFICATE_LABELS[cert]}</span>
                </label>
              );
            })}
          </div>
        ) : certificates.length === 0 ? (
          <p className="profile-empty-state">Ingen certifikater registreret.</p>
        ) : (
          certificates.map((cert) => (
            <div key={cert} className="cert-item">
              <span className="cert-item-name">{CERTIFICATE_LABELS[cert]}</span>
              <span className="cert-status-badge">✓ Aktiv</span>
            </div>
          ))
        )}
      </div>
    </ThemedSectionCard>
  );
};
