import React from 'react';
import './PublicClubHomePage.css';

interface PublicHomePageData {
  heroTitle?: string;
  heroSubtitle?: string;
  introTitle?: string;
  introBody?: string;
}

interface PublicClubHomePageProps {
  clubName: string;
  clubDisplayName: string;
  content: PublicHomePageData;
}

/**
 * PublicClubHomePage - Ported from EFK87 approved mockup.
 * 
 * This component preserves the visual hierarchy, section order, and layout
 * of the approved HTML/CSS mockup.
 */
export default function PublicClubHomePage({ clubName, clubDisplayName, content }: PublicClubHomePageProps) {
  // Use existing dynamic data where it fits, otherwise use mockup defaults
  const heroTitle = content.heroTitle || "En klubside med mere liv og bedre overblik.";
  const heroSubtitle = content.heroSubtitle || "Den nye forside er tænkt som en mere visuel indgang til klubben: aktivitet, indhold, hurtige valg og tydelige områder for både gæster, medlemmer og kommende medlemmer.";
  
  // Placeholder images - to be replaced by admin-managed media later
  const IMAGES = {
    heroMain: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1600&q=80',
    forum: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    gallery: 'https://images.unsplash.com/photo-1508615070457-7baeba4003ab?auto=format&fit=crop&w=1200&q=80',
    flyveskole: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    about: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
  };

  return (
    <div className="public-home">
      <div className="shell">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark">{clubName}</div>
            <div>
              <div>{clubDisplayName} Klubsite</div>
              <div className="small">Ny visuel forside med overblik, aktivitet og hurtige indgange</div>
            </div>
          </div>

          <nav className="nav">
            <a className="active" href="#">Forside</a>
            <a href="#">Forum</a>
            <a href="#">Galleri</a>
            <a href="#">Artikler</a>
            <a href="#">Flyveskole</a>
            <a href="#">Om {clubName}</a>
          </nav>

          <div className="actions">
            <a className="btn chip-btn" href="#">Min profil</a>
            <a className="btn chip-btn primary" href="#">Bliv medlem</a>
            <a className="btn chip-btn" href="#">Log ind</a>
          </div>
        </header>

        <section className="hero-grid">
          <article className="card hero-main" style={{ backgroundImage: `linear-gradient(180deg, rgba(6,10,18,0.18), rgba(6,10,18,0.84)), url('${IMAGES.heroMain}')` }}>
            <div className="eyebrow">✈️ Søndag 29. marts · Aktivitet på pladsen · Skoleflyvning i dag</div>
            <h1>{heroTitle}</h1>
            <p className="hero-copy">{heroSubtitle}</p>
            <div className="hero-actions">
              <a className="pill primary" href="#">Jeg flyver i dag</a>
              <a className="pill" href="#">Bliv medlem</a>
              <a className="pill" href="#">Se flyveskolen</a>
              <a className="pill" href="#">Åbn galleri</a>
            </div>
          </article>

          <div className="side-stack">
            {/* Placeholder data - Static mockup data */}
            <article className="card mini-card">
              <h3>Skoleflyvning i dag</h3>
              <p className="small">Skoleflyvningen er aktiv fra kl. 11:00. Brug bane 2 til elevstarter frem til middag. Poul Andersen og Lars Mortensen er på pladsen.</p>
              <div className="meta-row">
                <span className="meta-chip">4 elever tilmeldt</span>
                <span className="meta-chip">2 instruktører</span>
              </div>
            </article>

            <article className="card mini-card">
              <h3>Næste aktiviteter</h3>
              <p className="small">Klubåbning og kaffe kl. 10:30 · Skoleflyvning kl. 11:00 · Bestyrelsesmøde onsdag kl. 19:00 · Forårsoprydning lørdag kl. 09:30.</p>
              <div className="meta-row">
                <span className="meta-chip">Kalender</span>
                <span className="meta-chip">Live fra admin</span>
              </div>
            </article>
          </div>
        </section>

        <section className="tile-grid">
          {/* Tile: Forum */}
          <article className="tile">
            <div className="tile-hero" style={{ backgroundImage: `url('${IMAGES.forum}')` }}>
              <h3>Forum</h3>
            </div>
            <div className="tile-body">
              <p>Følg dialogen i klubben, se nye tråde og del erfaringer om udstyr, ture og flyvning.</p>
              <a className="tile-link" href="#">Åbn forum</a>
            </div>
          </article>

          {/* Tile: Galleri */}
          <article className="tile">
            <div className="tile-hero" style={{ backgroundImage: `url('${IMAGES.gallery}')` }}>
              <h3>Galleri</h3>
            </div>
            <div className="tile-body">
              <p>Se klubbens albums, seneste uploads og udvalgt aktivitet fra Facebook og Instagram.</p>
              <a className="tile-link" href="#">Åbn galleri</a>
            </div>
          </article>

          {/* Tile: Flyveskole */}
          <article className="tile">
            <div className="tile-hero" style={{ backgroundImage: `url('${IMAGES.flyveskole}')` }}>
              <h3>Flyveskole</h3>
            </div>
            <div className="tile-body">
              <p>Find vej ind i sporten med instruktører, skolekalender og en enkel introduktion til forløbet.</p>
              <a className="tile-link" href="#">Se flyveskolen</a>
            </div>
          </article>

          {/* Tile: Om EFK87 */}
          <article className="tile">
            <div className="tile-hero" style={{ backgroundImage: `url('${IMAGES.about}')` }}>
              <h3>Om {clubName}</h3>
            </div>
            <div className="tile-body">
              <p>Bestyrelse, regler, kontakt, vejvisning og de områder der kræver login som medlem.</p>
              <a className="tile-link" href="#">Læs om klubben</a>
            </div>
          </article>
        </section>

        <section className="activity-layout">
          <article className="card section-card">
            <div className="section-head">
              <h2>Aktivitet på pladsen</h2>
              <a className="link-soft" href="#">Se alle flyvemeddelser</a>
            </div>

            <div className="griffin-box">
              <div className="griffin">🦅</div>
              <div>
                <h3>Gribben basker – der er aktivitet i dag</h3>
                <p className="small">7 medlemmer har meldt “jeg flyver” i dag. Når første medlem melder sig, skifter gribben status og beskeden sendes til den valgte mailingliste.</p>
                <div className="hero-actions" style={{ marginTop: '14px' }}>
                  <a className="pill primary" href="#">Skriv “jeg flyver”</a>
                  <a className="pill" href="#">Se dagens liste</a>
                </div>
              </div>
            </div>

            <div className="list">
              {/* Placeholder: "Jeg flyver" rows */}
              <div className="row-item">
                <div className="row-icon">✈️</div>
                <div>
                  <div className="row-title">René Severinsen</div>
                  <div className="row-sub">“Kommer ca. 11:15 med DG-800.”</div>
                </div>
                <span className="status-badge info">09:07</span>
              </div>

              <div className="row-item">
                <div className="row-icon">🛠️</div>
                <div>
                  <div className="row-title">Lars Mikkelsen</div>
                  <div className="row-sub">“Er på pladsen fra 10:30. Tager lader med til 6S hvis nogen mangler.”</div>
                </div>
                <span className="status-badge info">08:48</span>
              </div>

              <div className="row-item">
                <div className="row-icon">🌬️</div>
                <div>
                  <div className="row-title">Søren Østergaard</div>
                  <div className="row-sub">“Ser vinden an – hvis den holder sig under 6 m/s kommer jeg med skræntkassen.”</div>
                </div>
                <span className="status-badge info">08:12</span>
              </div>
            </div>
          </article>

          <div>
            <article className="card section-card" style={{ marginBottom: '20px' }}>
              <div className="section-head">
                <h2>Seneste forumaktivitet</h2>
                <a className="link-soft" href="#">Åbn forum</a>
              </div>

              <div className="list">
                {/* Placeholder: Forum rows */}
                <div className="row-item">
                  <div className="row-icon">💬</div>
                  <div>
                    <div className="row-title">Forårsoprydning på pladsen – hvem kommer?</div>
                    <div className="row-sub">9 nye svar · Sidste svar af Jesper Holm for 14 min siden</div>
                  </div>
                  <span className="status-badge warn">32 svar</span>
                </div>

                <div className="row-item">
                  <div className="row-icon">🧭</div>
                  <div>
                    <div className="row-title">Nyt GPS-triangle setup til sæson 2026</div>
                    <div className="row-sub">4 nye svar · Sidste svar af René Severinsen for 43 min siden</div>
                  </div>
                  <span className="status-badge info">18 svar</span>
                </div>
              </div>
            </article>

            <article className="card section-card">
              <div className="section-head">
                <h2>Socialt og visuelt liv</h2>
              </div>

              <div className="social-grid">
                {/* Placeholder: Social items */}
                <div className="social-item">
                  <div className="social-icon">f</div>
                  <div>
                    <h3>Facebook-gruppen</h3>
                    <p>Seneste aktivitet fra gruppen kan vises her som et supplement til klubbens eget galleri og forum.</p>
                  </div>
                </div>

                <div className="social-item">
                  <div className="social-icon">◎</div>
                  <div>
                    <h3>Instagram</h3>
                    <p>Udvalgte billeder og highlights kan styrke den udadvendte profil uden at erstatte klubbens eget arkiv.</p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <footer className="card footer">
          <div>
            <h3>{clubName}</h3>
            <p className="small" style={{ marginTop: '10px' }}>Ny forside mockup med mere visuel struktur og tydeligere indgange til de vigtigste områder: aktivitet, forum, galleri, flyveskole og klubinformation.</p>
            <div className="sponsors">
              {/* Placeholder: Sponsors */}
              <span className="sponsor">Ellehammerfonden</span>
              <span className="sponsor">Friluftsrådet</span>
              <span className="sponsor">Dane-RC</span>
            </div>
          </div>
          <div>
            <h3>Kontakt</h3>
            <p className="small" style={{ marginTop: '10px' }}>{clubName}, Flyvestation Værløse, Shelter 331, 3500 Værløse</p>
            <p className="small" style={{ marginTop: '10px' }}>kontakt@efk87.dk<br />CVR 12345678</p>
          </div>
          <div>
            <h3>Links</h3>
            <p className="small" style={{ marginTop: '10px' }}>Forum<br />Galleri<br />Flyveskole<br />Om {clubName}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
