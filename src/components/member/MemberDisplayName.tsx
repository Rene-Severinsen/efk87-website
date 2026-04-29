import React from 'react';

export interface DisplayNameUser {
  name?: string | null;
  email?: string | null;
  memberProfiles?: {
    firstName?: string | null;
    lastName?: string | null;
  }[];
}

export function getMemberDisplayName(user: DisplayNameUser): string {
  const profile = user.memberProfiles?.[0];
  if (profile && (profile.firstName || profile.lastName)) {
    return `${profile.firstName} ${profile.lastName}`.trim();
  }
  
  if (user.name) {
    return user.name;
  }
  
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return 'Ukendt bruger';
}

export default function MemberDisplayName({ user }: { user: DisplayNameUser }) {
  return <>{getMemberDisplayName(user)}</>;
}
