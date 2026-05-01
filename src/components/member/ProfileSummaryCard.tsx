import React from 'react';
import Link from 'next/link';
import { ThemedSectionCard } from '../publicSite/ThemedBuildingBlocks';
import { ClubMemberCertificateType } from '@/generated/prisma';
import Avatar from '../shared/Avatar';

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
  memberNumber
}) => {
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

  return (
    <>
      <ThemedSectionCard className="profile-box">
        <div className="avatar-wrap">
          <Avatar 
            imageUrl={profileImageUrl} 
            name={name} 
            size="lg" 
            className="avatar"
            objectPosition="center 18%"
          />
        </div>

        <h3>{name}</h3>
        <p className="small" style={{ fontSize: '13px', color: 'var(--club-muted)' }}>
          {getStatusLabel(status)} · {getRoleLabel(role)}
          {memberNumber && ` · Medlemsnr. ${memberNumber}`}
        </p>


        <div className="info-list" style={{ marginTop: '1.5rem' }}>
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
          <div className="info-item">
            <h4>Skift adgangskode</h4>
            <p>Her kan du skifte din adgangskode.</p>
            <div style={{ marginTop: '1rem' }}>

            </div>
          </div>
        </div>
      </ThemedSectionCard>


    </>
  );
};
