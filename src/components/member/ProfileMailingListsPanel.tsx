import React from 'react';
import { ThemedSectionCard } from '../publicSite/ThemedBuildingBlocks';
import { ClubMailingListDto } from '@/lib/mailingLists/clubMailingListService';

interface ProfileMailingListsPanelProps {
  lists: ClubMailingListDto[];
}

export const ProfileMailingListsPanel: React.FC<ProfileMailingListsPanelProps> = ({ lists }) => {
  return (
    <ThemedSectionCard>
      <div className="section-head">
        <h2>Mailinglister</h2>
        <span>Oversigt over klubbens mailinglister</span>
      </div>

      <div className="mailing-grid">
        {lists.length === 0 ? (
          <p className="profile-empty-state">Ingen mailinglister fundet.</p>
        ) : (
          lists.map((list) => (
            <div key={list.id} className="mailing-card">
              <h4>{list.name}</h4>
              <p>{list.emailAddress}</p>
              {list.description && (
                <p className="mailing-card-description">{list.description}</p>
              )}
              <div className="mailing-card-footer">
                <span className="mailing-status-badge">Tilgængelig</span>
              </div>
            </div>
          ))
        )}
      </div>
    </ThemedSectionCard>
  );
};
