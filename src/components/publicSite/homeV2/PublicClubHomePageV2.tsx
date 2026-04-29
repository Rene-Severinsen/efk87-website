import React from 'react';
import './PublicClubHomePageV2.css';

/**
 * PublicClubHomePageV2 - Isolated V2 homepage component.
 * Ported closely from the provided mockup HTML.
 */
export default function PublicClubHomePageV2() {
  return (
    <div className="home-v2-root">
      <div className="home-v2-shell">
        <header className="home-v2-topbar">
          <div className="home-v2-brand">
            <div className="home-v2-brand-mark">EFK87</div>
            <div>
              <div>EFK87 Medlemsportal</div>
              <div className="home-v2-small">Østsjællands Flyveklub 87</div>
            </div>
          </div>

          <nav className="home-v2-nav">
            <a className="home-v2-active" href="#">Forside</a>
            <a href="#">Forum</a>
            <a href="#">Galleri</a>
            <a href="#">Artikler</a>
            <a href="#">Flyveskole</a>
            <a href="#">Mailinglister</a>
            <a href="#">Om EFK87</a>
          </nav>

          <div className="home-v2-actions">
            <a className="home-v2-btn home-v2-chip-btn" href="#">Min profil</a>
            <a className="home-v2-btn home-v2-chip-btn home-v2-primary" href="#">Admin</a>
            <a className="home-v2-btn home-v2-chip-btn" href="#">Log ud</a>
          </div>
        </header>

        <section className="home-v2-hero">
          <article className="home-v2-card home-v2-hero-main">
            <div className="home-v2-eyebrow">✈️ Sæsonstart 2026 · Søndag 29. marts · Vejr: 8°C og let sidevind</div>
            <h1>Hej René. Der er liv på pladsen i dag.</h1>
            <p className="home-v2-hero-copy">
              7 medlemmer har allerede meldt “jeg flyver”, skoleflyvning er <strong>aktiv fra kl. 11:00</strong>, og forumtråden om forårsoprydning har fået 9 nye svar siden i går.
            </p>
            <div className="home-v2-inline-actions">
              <a className="home-v2-pill home-v2-primary" href="#">Jeg flyver i dag</a>
              <a className="home-v2-pill" href="#">Åbn kalender</a>
              <a className="home-v2-pill" href="#">Gå til flyveskole</a>
              <a className="home-v2-pill" href="#">Upload billeder</a>
            </div>
          </article>

          <div className="home-v2-side-stack">
            <article className="home-v2-card home-v2-welcome-card">
              <div className="home-v2-welcome-grid">
                <div className="home-v2-avatar">RS</div>
                <div>
                  <h2>René Severinsen</h2>
                  <p className="home-v2-muted">Senior medlem · Instruktør · Bestyrelse</p>
                  <div className="home-v2-meta-row">
                    <span className="home-v2-meta-chip">A-certifikat</span>
                    <span className="home-v2-meta-chip">S-kontrollant</span>
                    <span className="home-v2-meta-chip">3 mailinglister</span>
                  </div>
                </div>
              </div>
            </article>

            <article className="home-v2-card home-v2-marquee-card">
              <div className="home-v2-marquee-label">Næste aktiviteter</div>
              <div className="home-v2-marquee">
                <div className="home-v2-marquee-track">
                  <span>• Søndag 10:30: Klubåbning og kaffe i skuret</span>
                  <span>• Søndag 11:00: Skoleflyvning – El-træner på bane 2</span>
                  <span>• Onsdag 19:00: Bestyrelsesmøde i klubhuset</span>
                  <span>• Lørdag 09:30: Forårsoprydning på pladsen</span>
                  <span>• Søndag 10:30: Klubåbning og kaffe i skuret</span>
                  <span>• Søndag 11:00: Skoleflyvning – El-træner på bane 2</span>
                  <span>• Onsdag 19:00: Bestyrelsesmøde i klubhuset</span>
                  <span>• Lørdag 09:30: Forårsoprydning på pladsen</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="home-v2-stats-row">
          <article className="home-v2-card home-v2-stat">
            <div className="home-v2-top">
              <small>Medlemmer online i dag</small>
              <span className="home-v2-status-badge home-v2-info">Live</span>
            </div>
            <div className="home-v2-value">23</div>
            <small>7 flere end sidste søndag kl. 16:00</small>
          </article>
          <article className="home-v2-card home-v2-stat">
            <div className="home-v2-top">
              <small>“Jeg flyver” i dag</small>
              <span className="home-v2-status-badge home-v2-ok">Aktiv</span>
            </div>
            <div className="home-v2-value">7</div>
            <small>Mail udsendt til Flyvermeddelelser kl. 09:12</small>
          </article>
          <article className="home-v2-card home-v2-stat">
            <div className="home-v2-top">
              <small>Skoleflyvning</small>
              <span className="home-v2-status-badge home-v2-ok">I gang</span>
            </div>
            <div className="home-v2-value">4</div>
            <small>Elever tilmeldt dagens session</small>
          </article>
          <article className="home-v2-card home-v2-stat">
            <div className="home-v2-top">
              <small>Nye forumindlæg</small>
              <span className="home-v2-status-badge home-v2-warn">+9</span>
            </div>
            <div className="home-v2-value">18</div>
            <small>Seneste 24 timer på tværs af 5 tråde</small>
          </article>
        </section>

        <section className="home-v2-layout">
          <div className="home-v2-stack">
            <article className="home-v2-card home-v2-section-card">
              <div className="home-v2-section-head">
                <h2>Aktivitet på pladsen</h2>
                <a className="home-v2-link-soft" href="#">Se alle flyvemeddelser</a>
              </div>

              <div className="home-v2-griffin">
                <div className="home-v2-griffin-emoji">🦅</div>
                <div>
                  <h3>Gribben basker – der er aktivitet i dag</h3>
                  <p className="home-v2-row-sub">Når mindst ét medlem melder ind, skifter forsiden status. Her vises din eksisterende grib-funktion med dagens mockup-data.</p>
                  <div className="home-v2-cta-row">
                    <a className="home-v2-pill home-v2-primary" href="#">Skriv “jeg flyver”</a>
                    <a className="home-v2-pill" href="#">Se dagens liste</a>
                  </div>
                </div>
              </div>

              <div className="home-v2-activity-list">
                <div className="home-v2-row-item">
                  <div className="home-v2-row-icon">✈️</div>
                  <div>
                    <div className="home-v2-row-title">René Severinsen</div>
                    <div className="home-v2-row-sub">“Kommer ca. 11:15 med DG-800.”</div>
                  </div>
                  <span className="home-v2-status-badge home-v2-info">09:07</span>
                </div>
                <div className="home-v2-row-item">
                  <div className="home-v2-row-icon">🛠️</div>
                  <div>
                    <div className="home-v2-row-title">Lars Mikkelsen</div>
                    <div className="home-v2-row-sub">“Er på pladsen fra 10:30. Tager lader med til 6S hvis nogen mangler.”</div>
                  </div>
                  <span className="home-v2-status-badge home-v2-info">08:48</span>
                </div>
                <div className="home-v2-row-item">
                  <div className="home-v2-row-icon">🌬️</div>
                  <div>
                    <div className="home-v2-row-title">Søren Østergaard</div>
                    <div className="home-v2-row-sub">“Ser vinden an – hvis den holder sig under 6 m/s kommer jeg skræntkassen.”</div>
                  </div>
                  <span className="home-v2-status-badge home-v2-info">08:12</span>
                </div>
              </div>
            </article>

            <article className="home-v2-card home-v2-section-card">
              <div className="home-v2-section-head">
                <h2>Forum – seneste aktivitet</h2>
                <a className="home-v2-link-soft" href="#">Åbn forum</a>
              </div>
              <div className="home-v2-thread-list">
                <div className="home-v2-row-item">
                  <div className="home-v2-row-icon">💬</div>
                  <div>
                    <div className="home-v2-row-title">Forårsoprydning på pladsen – hvem kommer?</div>
                    <div className="home-v2-row-sub">9 nye svar · Sidste svar af Jesper Holm for 14 min siden</div>
                  </div>
                  <span className="home-v2-status-badge home-v2-warn">32 svar</span>
                </div>
                <div className="home-v2-row-item">
                  <div className="home-v2-row-icon">🧭</div>
                  <div>
                    <div className="home-v2-row-title">Nyt GPS-triangle setup til sæson 2026</div>
                    <div className="home-v2-row-sub">4 nye svar · Sidste svar af René Severinsen for 43 min siden</div>
                  </div>
                  <span className="home-v2-status-badge home-v2-info">18 svar</span>
                </div>
                <div className="home-v2-row-item">
                  <div className="home-v2-row-icon">🔋</div>
                  <div>
                    <div className="home-v2-row-title">Bedste lader til 12V i klubhuset?</div>
                    <div className="home-v2-row-sub">Ny tråd oprettet i dag · 3 svar · Teknik</div>
                  </div>
                  <span className="home-v2-status-badge home-v2-ok">Ny</span>
                </div>
              </div>
            </article>

            <article className="home-v2-card home-v2-section-card">
              <div className="home-v2-section-head">
                <h2>Seneste billeder</h2>
                <a className="home-v2-link-soft" href="#">Åbn galleri</a>
              </div>
              <div className="home-v2-gallery-grid">
                <div className="home-v2-gallery-item" style={{backgroundImage: "url('https://images.unsplash.com/photo-1508615070457-7baeba4003ab?auto=format&fit=crop&w=900&q=80')"}}><span>ASW-28 · I dag</span></div>
                <div className="home-v2-gallery-item" style={{backgroundImage: "url('https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&w=900&q=80')"}}><span>Klubpladsen</span></div>
                <div className="home-v2-gallery-item" style={{backgroundImage: "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80')"}}><span>Skoleflyvning</span></div>
                <div className="home-v2-gallery-item" style={{backgroundImage: "url('https://images.unsplash.com/photo-1496449903678-68ddcb189a24?auto=format&fit=crop&w=900&q=80')"}}><span>Skræntdag</span></div>
                <div className="home-v2-gallery-item" style={{backgroundImage: "url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=900&q=80')"}}><span>Klubhuset</span></div>
                <div className="home-v2-gallery-item" style={{backgroundImage: "url('https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80')"}}><span>Solnedgang</span></div>
              </div>
            </article>
          </div>

          <div className="home-v2-stack">
            <article className="home-v2-card home-v2-section-card">
              <div className="home-v2-section-head">
                <h2>Skoleflyvning i dag</h2>
                <a className="home-v2-link-soft" href="#">Skolekalender</a>
              </div>
              <div className="home-v2-mini-grid">
                <div className="home-v2-mini-card">
                  <div className="home-v2-muted">Status</div>
                  <h3 style={{marginTop: '8px'}}>Aktiv fra kl. 11:00</h3>
                  <p className="home-v2-row-sub" style={{marginTop: '8px'}}>Instruktør: Poul Andersen</p>
                </div>
                <div className="home-v2-mini-card">
                  <div className="home-v2-muted">Dagens note</div>
                  <p className="home-v2-row-sub" style={{marginTop: '8px'}}>Banen er lidt blød mod øst. Brug bane 2 til elevstarter frem til middag.</p>
                </div>
              </div>
              <div className="home-v2-cta-row">
                <a className="home-v2-pill home-v2-primary" href="#">Skriv besked til elever</a>
                <a className="home-v2-pill" href="#">Se elever</a>
              </div>
            </article>

            <article className="home-v2-card home-v2-section-card">
              <div className="home-v2-section-head">
                <h2>Klubchat</h2>
                <a className="home-v2-link-soft" href="#">Åbn Nextcloud Talk</a>
              </div>
              <div className="home-v2-mailing-list">
                <div className="home-v2-row-item">
                  <div className="home-v2-row-icon">💬</div>
                  <div>
                    <div className="home-v2-row-title">Mikkel Hansen</div>
                    <div className="home-v2-row-sub">Er der nogen på pladsen omkring kl. 17? Jeg tager ASW-28 med.</div>
                  </div>
                  <span className="home-v2-status-badge home-v2-info">2 min</span>
                </div>
                <div className="home-v2-row-item">
                  <div className="home-v2-row-icon">🛩️</div>
                  <div>
                    <div className="home-v2-row-title">Poul Andersen</div>
                    <div className="home-v2-row-sub">Skoleflyvning kører som planlagt. Husk at banen er blød mod øst.</div>
                  </div>
                  <span className="home-v2-status-badge home-v2-info">11 min</span>
                </div>
                <div className="home-v2-row-item">
                  <div className="home-v2-row-icon">📸</div>
                  <div>
                    <div className="home-v2-row-title">Jesper Holm</div>
                    <div className="home-v2-row-sub">Jeg har lagt 12 nye billeder i albummet fra skræntdagen.</div>
                  </div>
                  <span className="home-v2-status-badge home-v2-info">28 min</span>
                </div>
                <div className="home-v2-row-item">
                  <div className="home-v2-row-icon">☕</div>
                  <div>
                    <div className="home-v2-row-title">Lars Mortensen</div>
                    <div className="home-v2-row-sub">Kaffe på pladsen fra kl. 10:30. Jeg tager kage med.</div>
                  </div>
                  <span className="home-v2-status-badge home-v2-info">43 min</span>
                </div>
                <div className="home-v2-row-item">
                  <div className="home-v2-row-icon">🔧</div>
                  <div>
                    <div className="home-v2-row-title">Anne Sørensen</div>
                    <div className="home-v2-row-sub">Hvem har lånt starteren fra værkstedet? Skriv lige herinde.</div>
                  </div>
                  <span className="home-v2-status-badge home-v2-info">1 t</span>
                </div>
              </div>
              <div className="home-v2-cta-row">
                <a className="home-v2-pill home-v2-primary" href="#">Skriv i chatten</a>
                <a className="home-v2-pill" href="#">Se alle beskeder</a>
              </div>
            </article>

            <article className="home-v2-card home-v2-section-card">
              <div className="home-v2-section-head">
                <h2>Hurtige genveje</h2>
              </div>
              <div className="home-v2-quick-list">
                <a className="home-v2-row-item" href="#">
                  <div className="home-v2-row-icon">📜</div>
                  <div>
                    <div className="home-v2-row-title">Vedtægter</div>
                    <div className="home-v2-row-sub">Klubbens formelle vedtægter og rammer for medlemskab</div>
                  </div>
                  <span className="home-v2-status-badge home-v2-info">Åbn</span>
                </a>
                <a className="home-v2-row-item" href="#">
                  <div className="home-v2-row-icon">⚠️</div>
                  <div>
                    <div className="home-v2-row-title">Pladsregler</div>
                    <div className="home-v2-row-sub">Sikkerhed, flyvning, brug af bane og fælles regler på pladsen</div>
                  </div>
                  <span className="home-v2-status-badge home-v2-info">Åbn</span>
                </a>
                <a className="home-v2-row-item" href="#">
                  <div className="home-v2-row-icon">🗓️</div>
                  <div>
                    <div className="home-v2-row-title">Skolekalender</div>
                    <div className="home-v2-row-sub">Se planlagte skoleflyvninger, tider og dagens instruktion</div>
                  </div>
                  <span className="home-v2-status-badge home-v2-info">Åbn</span>
                </a>
              </div>
            </article>
          </div>
        </section>

        <footer className="home-v2-card home-v2-footer">
          <div>
            <h3>EFK87</h3>
            <p className="home-v2-small" style={{marginTop: '10px'}}>Mockup af medlemsforside med realistisk klubstruktur. Designet er tænkt mobile first på medlemsdelen og mere informationsrigt på desktop.</p>
            <div className="home-v2-sponsors">
              <span className="home-v2-sponsor">Ellehammerfonden</span>
              <span className="home-v2-sponsor">Friluftsrådet</span>
              <span className="home-v2-sponsor">Dane-RC</span>
              <span className="home-v2-sponsor">Køb din sponsor plads her</span>
            </div>
          </div>
          <div>
            <h3>Kontakt</h3>
            <p className="home-v2-small" style={{marginTop: '10px'}}>EFK87, Flyvestation Værløse, Shelter 331, 3500 Værløse</p>
            <p className="home-v2-small" style={{marginTop: '10px'}}>kontakt@efk87.dk<br/>CVR 12345678</p>
          </div>
          <div>
            <h3>Links</h3>
            <p className="home-v2-small" style={{marginTop: '10px'}}>Regler og bestemmelser<br/>Bestyrelsen<br/>Her bor vi<br/>Privatliv og cookies</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
