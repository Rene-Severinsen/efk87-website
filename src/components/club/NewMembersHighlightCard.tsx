import React from 'react';
import { NewMemberHighlight } from '../../lib/members/newMemberHighlightService';
import Avatar from '../shared/Avatar';

interface NewMembersHighlightCardProps {
  clubName: string;
  members: NewMemberHighlight[];
}

export default function NewMembersHighlightCard({ clubName, members }: NewMembersHighlightCardProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('da-DK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <article className="home-v2-card new-members-highlight-card">
      <div className="new-members-header">
        <div className="new-members-logo-slot">
          {/* Logo placeholder */}
          <div className="logo-placeholder">🚀</div>
        </div>
        <div>
          <h2>Nye medlemmer</h2>
          <p className="home-v2-muted">Velkommen i klubben</p>
        </div>
      </div>
      
      <div className="new-members-content">
        <p>{clubName} byder velkommen til følgende nye medlemmer:</p>
        
        <ul className="new-members-list">
          {members.map((member) => (
            <li key={member.id} className="new-member-item">
              <Avatar 
                imageUrl={member.profileImageUrl} 
                name={member.displayName} 
                size="sm" 
              />
              <div className="new-member-info">
                <span className="member-name">{member.displayName}</span>
                <span className="member-date home-v2-muted"> (pr. {formatDate(member.joinedAt)})</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
