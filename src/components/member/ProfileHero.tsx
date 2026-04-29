import React from 'react';

export const ProfileHero: React.FC = () => {
  return (
    <section className="profile-hero">
      <div className="eyebrow" style={{ 
        display: 'inline-flex', 
        gap: '8px', 
        alignItems: 'center', 
        padding: '8px 12px', 
        borderRadius: '999px', 
        background: 'rgba(11,18,32,0.58)', 
        border: '1px solid rgba(255,255,255,0.12)', 
        width: 'fit-content', 
        color: '#d8e3ff', 
        fontSize: '13px', 
        marginBottom: '14px' 
      }}>
        👤 Min profil · Oplysninger, profilbillede, certifikater og mailinglister
      </div>
      <h1>Din profil i klubben.</h1>
      <p className="hero-copy" style={{ 
        fontSize: '16px', 
        lineHeight: 1.6, 
        color: '#d7e2fb', 
        maxWidth: '68ch', 
        marginBottom: '18px' 
      }}>
        Her vedligeholder du dine egne oplysninger, skifter password, uploader profilbillede, markerer certifikater og vælger hvilke mailinglister du vil være med på.
      </p>

    </section>
  );
};
