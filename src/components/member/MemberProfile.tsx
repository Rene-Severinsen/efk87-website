import React from 'react';
import './MemberProfile.css';
import { ProfileHero } from './ProfileHero';
import { ProfileSummaryCard } from './ProfileSummaryCard';
import { ProfileDetailsPanel } from './ProfileDetailsPanel';
import { ProfileCertificatesPanel } from './ProfileCertificatesPanel';
import { ProfileMailingListsPanel } from './ProfileMailingListsPanel';
import { MemberProfileDTO } from '@/lib/members/memberProfileService';
import { getMemberDisplayName } from '@/lib/members/memberUtils';

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
  const displayName = getMemberDisplayName(profile, { name: viewer.name, email: viewer.email });

  return (
    <div className="member-profile-content">
      <ProfileHero />

      <div className="profile-layout">
        <div className="profile-stack">
          <ProfileSummaryCard 
            name={displayName}
            role={profile.memberRoleType}
            status={profile.memberStatus}
            profileImageUrl={profile.profileImageUrl}
            membershipType={profile.membershipType}
            certificates={profile.certificates}
            memberNumber={profile.memberNumber}
          />
        </div>

        <div className="profile-stack">
          <ProfileDetailsPanel 
            firstName={firstName}
            lastName={lastName}
            email={profile.email || viewer.email}
            mobilePhone={profile.mobilePhone || ''}
            addressLine={profile.addressLine || ''}
            postalCode={profile.postalCode || ''}
            city={profile.city || ''}
            memberNumber={profile.memberNumber}
            mdkNumber={profile.mdkNumber || ''}
            birthDate={profile.birthDate}
            joinedAt={profile.joinedAt}
            schoolStatus={profile.schoolStatus}
            isInstructor={profile.isInstructor}
          />
          
          <ProfileCertificatesPanel certificates={profile.certificates} />
          
          <ProfileMailingListsPanel />
        </div>
      </div>
    </div>
  );
};
