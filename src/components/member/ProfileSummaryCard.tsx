import React from 'react';
import Link from 'next/link';
import { ThemedSectionCard } from '../publicSite/ThemedBuildingBlocks';
import { ClubMemberCertificateType } from '@/generated/prisma';
import Avatar from '../shared/Avatar';
import { publicRoutes } from '../../lib/publicRoutes';

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
                                                                        memberNumber,
                                                                      }) => {
  const getRoleLabel = (value: string) => {
    switch (value) {
      case 'REGULAR':
        return 'Almindelig medlem';
      case 'BOARD_MEMBER':
        return 'Bestyrelsesmedlem';
      case 'BOARD_SUPPLEANT':
        return 'Bestyrelsessuppleant';
      case 'TREASURER':
        return 'Kasserer';
      case 'CHAIRMAN':
        return 'Formand';
      case 'VICE_CHAIRMAN':
        return 'Næstformand';
      default:
        return value;
    }
  };

  const getStatusLabel = (value: string) => {
    switch (value) {
      case 'ACTIVE':
        return 'Aktiv';
      case 'RESIGNED':
        return 'Udmeldt';
      case 'NEW':
        return 'Ny';
      default:
        return value;
    }
  };

  return (
      <ThemedSectionCard className="profile-box">
        <div className="avatar-wrap">
          <Avatar
              imageUrl={profileImageUrl}
              name={name}
              size="lg"
              className="avatar"
              shape="rounded"
              objectPosition="center 1%"
          />
        </div>

        <h3>{name}</h3>

        <p className="profile-summary-meta">
          {getStatusLabel(status)} · {getRoleLabel(role)}
          {memberNumber ? ` · Medlemsnr. ${memberNumber}` : ''}
        </p>

        <div className="profile-summary-actions">
          <div className="profile-summary-action">
            <h4>Udskriv medlemskort</h4>
            <p>Her kan du udskrive dit medlemskort til brug i klubben.</p>

            <div className="mt-5 flex justify-center">
              <Link
                  href={publicRoutes.profileMemberCard(clubSlug)}
                  className="public-primary-button"
              >
                Gå til medlemskort
              </Link>
            </div>
          </div>

          <div className="profile-summary-action">
            <h4>Skift adgangskode</h4>
            <p>Her kan du skifte din adgangskode.</p>
          </div>
        </div>
      </ThemedSectionCard>
  );
};