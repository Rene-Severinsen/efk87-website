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

      <div className="mailing-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '16px',
        marginTop: '16px'
      }}>
        {lists.length === 0 ? (
          <p style={{ opacity: 0.5, fontStyle: 'italic', padding: '12px 0', gridColumn: '1 / -1' }}>
            Ingen mailinglister fundet
          </p>
        ) : (
          lists.map((list) => (
            <div key={list.id} className="mailing-card" style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--club-line)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <h4 style={{ margin: 0, fontSize: '16px', color: 'white' }}>{list.name}</h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--club-muted)', wordBreak: 'break-all' }}>{list.emailAddress}</p>
              {list.description && (
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.4' }}>
                  {list.description}
                </p>
              )}
              <div className="toggle-row" style={{ 
                marginTop: 'auto', 
                paddingTop: '12px', 
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span className="small" style={{ fontSize: '12px', color: 'var(--club-accent)', fontWeight: 'bold' }}>TILGÆNGELIG</span>
              </div>
            </div>
          ))
        )}
      </div>
    </ThemedSectionCard>
  );
};
