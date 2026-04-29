import React from 'react';
import { ThemedSectionCard } from '../publicSite/ThemedBuildingBlocks';

export const ProfileMailingListsPanel: React.FC = () => {
  return (
    <ThemedSectionCard>
      <div className="section-head">
        <h2>Mailinglister</h2>
        <span>Tilmeld og frameld dig selv</span>
      </div>

      <div className="mailing-grid">
        {/* Real mailing list config/sync is future scope */}
        <div className="mailing-card">
          <h4>EFK87</h4>
          <p>efk87@efk87.dk</p>
          <div className="toggle-row">
            <span className="small">Tilmeldt</span>
            <div className="fake-switch"></div>
          </div>
        </div>

        <div className="mailing-card">
          <h4>Flyvermeddelelser</h4>
          <p>website@efk87.dk</p>
          <div className="toggle-row">
            <span className="small">Tilmeldt</span>
            <div className="fake-switch"></div>
          </div>
        </div>

        <div className="mailing-card">
          <h4>Skræntlisten</h4>
          <p>skraentlisten@efk87.dk</p>
          <div className="toggle-row">
            <span className="small">Tilmeldt</span>
            <div className="fake-switch"></div>
          </div>
        </div>

        <div className="mailing-card">
          <h4>Tur til andre klubber</h4>
          <p>turtilandreklubberlisten@efk87.dk</p>
          <div className="toggle-row">
            <span className="small">Fravalgt</span>
            <div className="fake-switch" style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', left: '2px', right: 'auto', position: 'absolute', top: '2px', width: '22px', height: '22px', borderRadius: '50%' }}></div>
            </div>
          </div>
        </div>

        <div className="mailing-card">
          <h4>Gavl</h4>
          <p>gavl@efk87.dk</p>
          <div className="toggle-row">
            <span className="small">Fravalgt</span>
            <div className="fake-switch" style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', left: '2px', right: 'auto', position: 'absolute', top: '2px', width: '22px', height: '22px', borderRadius: '50%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </ThemedSectionCard>
  );
};
