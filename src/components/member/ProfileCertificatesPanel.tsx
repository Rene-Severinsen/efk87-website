"use client";

import React, { useState, useTransition } from 'react';
import { ThemedSectionCard } from '../publicSite/ThemedBuildingBlocks';
import { ClubMemberCertificateType } from '@/generated/prisma';
import { CERTIFICATE_LABELS, ALL_CERTIFICATE_TYPES } from '@/lib/members/memberConstants';
import { updateOwnMemberCertificatesAction } from '@/lib/members/memberProfileActions';

interface ProfileCertificatesPanelProps {
  clubId: string;
  clubSlug: string;
  certificates?: ClubMemberCertificateType[];
}

export const ProfileCertificatesPanel: React.FC<ProfileCertificatesPanelProps> = ({ 
  clubId,
  clubSlug,
  certificates = [] 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCerts, setSelectedCerts] = useState<ClubMemberCertificateType[]>(certificates);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleToggleCert = (cert: ClubMemberCertificateType) => {
    setSelectedCerts(prev => 
      prev.includes(cert) 
        ? prev.filter(c => c !== cert) 
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
      <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Certifikater</h2>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-accent hover:underline text-sm font-medium"
            style={{ color: 'var(--club-accent)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Rediger
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={handleCancel}
              disabled={isPending}
              className="text-sm font-medium"
              style={{ color: 'var(--club-muted)', background: 'none', border: 'none', cursor: 'pointer', opacity: isPending ? 0.5 : 1 }}
            >
              Annuller
            </button>
            <button 
              onClick={handleSave}
              disabled={isPending}
              className="text-sm font-bold"
              style={{ color: 'var(--club-accent)', background: 'none', border: 'none', cursor: 'pointer', opacity: isPending ? 0.5 : 1 }}
            >
              {isPending ? 'Gemmer...' : 'Gem'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div style={{ color: '#ff4d4f', fontSize: '13px', marginTop: '8px', padding: '8px', background: 'rgba(255, 77, 79, 0.1)', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div className="cert-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px' }}>
        {isEditing ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
            {ALL_CERTIFICATE_TYPES.map((cert) => (
              <label 
                key={cert} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '10px', 
                  background: 'rgba(255,255,255,0.05)', 
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: selectedCerts.includes(cert) ? '1px solid var(--club-accent)' : '1px solid transparent'
                }}
              >
                <input 
                  type="checkbox" 
                  checked={selectedCerts.includes(cert)}
                  onChange={() => handleToggleCert(cert)}
                  style={{ accentColor: 'var(--club-accent)' }}
                />
                <span style={{ fontSize: '14px', color: selectedCerts.includes(cert) ? 'white' : 'var(--club-muted)' }}>
                  {CERTIFICATE_LABELS[cert]}
                </span>
              </label>
            ))}
          </div>
        ) : (
          certificates.length === 0 ? (
            <p style={{ opacity: 0.5, fontStyle: 'italic', padding: '12px 0' }}>
              Ingen certifikater registreret.
            </p>
          ) : (
            certificates.map((cert) => (
              <div key={cert} className="cert-item" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '12px 0', 
                borderBottom: '1px solid var(--club-line)' 
              }}>
                <span style={{ fontWeight: 500 }}>{CERTIFICATE_LABELS[cert]}</span>
                <span style={{ color: 'var(--club-accent)', fontSize: '12px', fontWeight: 'bold' }}>✓ AKTIV</span>
              </div>
            ))
          )
        )}
      </div>
    </ThemedSectionCard>
  );
};
