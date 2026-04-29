import React from 'react';
import './MemberProfile.css';
import { ProfileHero } from './ProfileHero';
import { ProfileSummaryCard } from './ProfileSummaryCard';
import { ProfileDetailsPanel } from './ProfileDetailsPanel';
import { ProfileCertificatesPanel } from './ProfileCertificatesPanel';
import { ProfileMailingListsPanel } from './ProfileMailingListsPanel';
import { MemberProfileDTO } from '@/lib/members/memberProfileService';

interface ProfilePageContentProps {
  viewer: {
    userId: string;
    name: string;
    email: string;
    clubRole: string;
    membershipStatus: string;
  };
  profile: MemberProfileDTO;
}

export const MemberProfile: React.FC<ProfilePageContentProps> = ({ viewer, profile }) => {
  const firstName = profile.firstName || '';
  const lastName = profile.lastName || '';

  return (
    <div className="member-profile-content">
      <ProfileHero />

      <div className="profile-layout">
        <div className="profile-stack">
          <ProfileSummaryCard 
            name={profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : viewer.name}
            role={profile.memberRoleType}
            status={profile.memberStatus}
            profileImageUrl={profile.profileImageUrl}
            membershipType={profile.membershipType}
            certificates={profile.certificates}
          />
        </div>

        <div className="profile-stack">
          <ProfileDetailsPanel 
            firstName={firstName}
            lastName={lastName}
            email={viewer.email}
            mobilePhone={profile.mobilePhone || ''}
            addressLine={profile.addressLine || ''}
            postalCode={profile.postalCode || ''}
            city={profile.city || ''}
          />
          
          <ProfileCertificatesPanel certificates={profile.certificates} />
          
          <ProfileMailingListsPanel />
        </div>
      </div>
    </div>
  );
};
