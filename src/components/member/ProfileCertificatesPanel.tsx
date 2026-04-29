import React from 'react';
import { ThemedSectionCard } from '../publicSite/ThemedBuildingBlocks';

export const ProfileCertificatesPanel: React.FC = () => {
  return (
    <ThemedSectionCard>
      <div className="section-head">
        <h2>Certifikater</h2>
        <span>Markér det du har taget</span>
      </div>

      <div className="cert-grid">
        {/* Certificate data model/persistence is future scope */}
        <div className="cert-card">
          <h4>A-kategori</h4>
          <p>A-certifikat · A-kontrollant · A-stormodel · A-stormodel kontrollant</p>
          <div className="toggle-row">
            <span className="small">Markeret på profil</span>
            <div className="fake-switch"></div>
          </div>
        </div>

        <div className="cert-card">
          <h4>S-kategori</h4>
          <p>S-certifikat · S-kontrollant · S-stormodel · S-stormodel kontrollant</p>
          <div className="toggle-row">
            <span className="small">Markeret på profil</span>
            <div className="fake-switch"></div>
          </div>
        </div>

        <div className="cert-card">
          <h4>H-kategori</h4>
          <p>H-certifikat · H-kontrollant · H-stormodel · H-stormodel kontrollant</p>
          <div className="toggle-row">
            <span className="small">Kan opdateres</span>
            <div className="fake-switch" style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', left: '2px', right: 'auto', position: 'absolute', top: '2px', width: '22px', height: '22px', borderRadius: '50%' }}></div>
            </div>
          </div>
        </div>

        <div className="cert-card">
          <h4>J-kategori</h4>
          <p>J-stormodel · J-stormodel kontrollant</p>
          <div className="toggle-row">
            <span className="small">Kan opdateres</span>
            <div className="fake-switch" style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', left: '2px', right: 'auto', position: 'absolute', top: '2px', width: '22px', height: '22px', borderRadius: '50%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </ThemedSectionCard>
  );
};
