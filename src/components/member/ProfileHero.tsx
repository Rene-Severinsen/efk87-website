import React from 'react';

export const ProfileHero: React.FC = () => {
  return (
    <section className="profile-hero">
      <div className="profile-hero-eyebrow">
        <span aria-hidden="true">👤</span>
        <span>Min profil · Oplysninger, profilbillede, certifikater og mailinglister</span>
      </div>

      <h1>Din profil i klubben.</h1>

      <p className="profile-hero-copy">
        Her vedligeholder du dine egne oplysninger, skifter password, uploader profilbillede,
        markerer certifikater og vælger hvilke mailinglister du vil være med på.
      </p>
    </section>
  );
};
