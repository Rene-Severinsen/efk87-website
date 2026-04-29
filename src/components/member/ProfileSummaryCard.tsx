import React from 'react';
import Link from 'next/link';
import { ThemedSectionCard } from '../publicSite/ThemedBuildingBlocks';
import { ClubMemberCertificateType } from '@/generated/prisma';

interface ProfileSummaryCardProps {
  clubSlug: string;
  name: string;
  role: string;
  status: string;
  profileImageUrl?: string | null;
  membershipType?: string;
  certificates?: ClubMemberCertificateType[];
  memberNumber?: number | null;
}

export const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({ 
  clubSlug,
  name, 
  role, 
  status,
  profileImageUrl,
  membershipType,
  certificates = [],
  memberNumber
}) => {
  // Generate initials for the avatar placeholder
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const getRoleLabel = (r: string) => {
    switch (r) {
      case 'REGULAR': return 'Almindelig medlem';
      case 'BOARD_MEMBER': return 'Bestyrelsesmedlem';
      case 'BOARD_SUPPLEANT': return 'Bestyrelsessuppleant';
      case 'TREASURER': return 'Kasserer';
      case 'CHAIRMAN': return 'Formand';
      case 'VICE_CHAIRMAN': return 'Næstformand';
      default: return r;
    }
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'ACTIVE': return 'Aktiv';
      case 'RESIGNED': return 'Udmeldt';
      case 'NEW': return 'Ny';
      default: return s;
    }
  };

  const getMembershipLabel = (m: string) => {
    switch (m) {
      case 'SENIOR': return 'Senior';
      case 'JUNIOR': return 'Junior';
      case 'PASSIVE': return 'Passiv';
      default: return m;
    }
  };

  const getCertLabel = (c: string) => {
    return c.replace(/_/g, '-').replace('CERTIFICATE', 'certifikat');
  };

  return (
    <>
      <ThemedSectionCard className="profile-box">
        <div className="avatar-wrap">
          <div className="avatar">
            {profileImageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={profileImageUrl} alt={name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: 'var(--club-text)' }}>{initials}</span>
            )}
          </div>
        </div>

        <h3>{name}</h3>
        <p className="small" style={{ fontSize: '13px', color: 'var(--club-muted)' }}>
          {getStatusLabel(status)} · {getRoleLabel(role)}
          {memberNumber && ` · Medlemsnr. ${memberNumber}`}
        </p>

        <div className="meta-row">
          {membershipType && (
            <span className="meta-chip" style={{ background: 'rgba(255,255,255,0.1)' }}>{getMembershipLabel(membershipType)}</span>
          )}
          {certificates.slice(0, 3).map(cert => (
            <span key={cert} className="meta-chip">{getCertLabel(cert)}</span>
          ))}
          {certificates.length > 3 && (
            <span className="meta-chip">+{certificates.length - 3}</span>
          )}
        </div>
      </ThemedSectionCard>

      <ThemedSectionCard>
        <div className="section-head">
          <h2>Profilbillede</h2>
        </div>

        <div className="info-list">
          <div className="info-item">
            <h4>Håndtering af profilbillede</h4>
            <p>Du kan i øjeblikket ikke uploade dit eget profilbillede. Kontakt en administrator hvis du ønsker at få tilføjet eller ændret dit billede.</p>
          </div>
        </div>
      </ThemedSectionCard>

      <ThemedSectionCard>
        <div className="section-head">
          <h2>Adgang og sikkerhed</h2>
        </div>
        <div className="profile-list">
          <div className="profile-list-item">
            <h4>Sikkerhed</h4>
            <p>Din adgang styres via dit login. Password kan ikke ændres direkte herfra endnu.</p>
          </div>
        </div>
      </ThemedSectionCard>

      <ThemedSectionCard>
        <div className="section-head">
          <h2>Medlemskort</h2>
        </div>
        <div className="info-list">
          <div className="info-item">
            <h4>Udskriv medlemskort</h4>
            <p>Her kan du udskrive dit medlemskort til brug i klubben.</p>
            <div style={{ marginTop: '1rem' }}>
              <Link 
                href={`/${clubSlug}/profil/medlemskort`}
                className="themed-button"
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--club-accent)',
                  color: 'white',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Gå til medlemskort
              </Link>
            </div>
          </div>
        </div>
      </ThemedSectionCard>
    </>
  );
};
