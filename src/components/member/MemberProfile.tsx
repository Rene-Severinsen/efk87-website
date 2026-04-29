import React from 'react';
import './MemberProfile.css';
import { ProfileHero } from './ProfileHero';
import { ProfileSummaryCard } from './ProfileSummaryCard';
import { ProfileDetailsPanel } from './ProfileDetailsPanel';
import { ProfileCertificatesPanel } from './ProfileCertificatesPanel';
import { ProfileMailingListsPanel } from './ProfileMailingListsPanel';

interface ProfilePageContentProps {
  viewer: {
    name: string;
    email: string;
    clubRole: string;
    membershipStatus: string;
  };
}

export const MemberProfile: React.FC<ProfilePageContentProps> = ({ viewer }) => {
  // Split name for form fields if possible
  const nameParts = viewer.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return (
    <div className="member-profile-content">
      <ProfileHero />

      <div className="profile-layout">
        <div className="profile-stack">
          <ProfileSummaryCard 
            name={viewer.name}
            role={viewer.clubRole}
            status={viewer.membershipStatus}
          />
        </div>

        <div className="profile-stack">
          <ProfileDetailsPanel 
            firstName={firstName}
            lastName={lastName}
            email={viewer.email}
          />
          
          <ProfileCertificatesPanel />
          
          <ProfileMailingListsPanel />
        </div>
      </div>
    </div>
  );
};
