import React from 'react';
import './PublicClubHomePage.css';
import { ClubTheme, PublicHomeFeatureTile, ClubFlightIntent, PublicHomeInfoCard, PublicClubFooter, PublicSponsor } from "../../generated/prisma";
import { PublicNavigationItem } from "../../lib/publicSite/publicNavigation";

interface PublicFooterData {
  footer: PublicClubFooter | null;
  sponsors: PublicSponsor[];
}

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
  theme?: ClubTheme;
  featureTiles?: PublicHomeFeatureTile[];
  infoCards?: PublicHomeInfoCard[];
  flightIntents?: ClubFlightIntent[];
  footerData?: PublicFooterData;
  navigationItems?: PublicNavigationItem[];
  actionItems?: PublicNavigationItem[];
}

/**
 * PublicClubHomePage - Ported from EFK87 approved mockup.
 * 
 * This component preserves the visual hierarchy, section order, and layout
 * of the approved HTML/CSS mockup.
 */
export default function PublicClubHomePage({ 
  clubName, 
  clubDisplayName, 
  content, 
  theme, 
  featureTiles, 
  infoCards, 
  flightIntents, 
  footerData,
  navigationItems = [],
  actionItems = []
}: PublicClubHomePageProps) {
  // Use existing dynamic data where it fits, otherwise use mockup defaults
  const heroTitle = content.heroTitle || "En klubside med mere liv og bedre overblik.";
  const heroSubtitle = content.heroSubtitle || "Den nye forside er tænkt som en mere visuel indgang til klubben: aktivitet, indhold, hurtige valg og tydelige områder for både gæster, medlemmer og kommende medlemmer.";
  
  // Theme CSS variables
  const themeStyles = theme ? {
    '--club-bg': theme.backgroundColor,
    '--club-panel': theme.panelColor,
    '--club-panel-soft': theme.panelSoftColor,
    '--club-line': theme.lineColor,
    '--club-text': theme.textColor,
    '--club-muted': theme.mutedTextColor,
    '--club-accent': theme.accentColor,
    '--club-accent-2': theme.accentColor2,
    '--club-shadow': theme.shadowValue,
    '--club-radius': theme.radiusValue,
  } as React.CSSProperties : {};

  // Placeholder images - to be replaced by admin-managed media later
  const IMAGES = {
    heroMain: theme?.heroImageUrl || 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1600&q=80',
    forum: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    gallery: 'https://images.unsplash.com/photo-1508615070457-7baeba4003ab?auto=format&fit=crop&w=1200&q=80',
    flyveskole: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    about: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
  };

  const activityIcons: Record<string, string> = {
    FLYING: '✈️',
    MAINTENANCE: '🛠️',
    WEATHER_DEPENDENT: '🌬️',
    TRAINING: '🎓',
    SOCIAL: '☕',
    OTHER: '•',
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('da-DK', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(date));
  };

  return (
    <div className="public-home" style={themeStyles}>
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
            {navigationItems.map((item) => (
              <a 
                key={item.key} 
                href={item.href}
                className={item.key === 'home' ? 'active' : ''}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="actions">
            {actionItems.map((item) => (
              <a 
                key={item.key} 
                href={item.href}
                className={`btn chip-btn ${item.isPrimary ? 'primary' : ''}`}
              >
                {item.label}
              </a>
            ))}
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
            {(infoCards && infoCards.length > 0) ? (
              infoCards.map((card) => (
                <article className="card mini-card" key={card.id}>
                  <h3>{card.title}</h3>
                  <p className="small">{card.body}</p>
                  <div className="meta-row">
                    {card.badge1 && <span className="meta-chip">{card.badge1}</span>}
                    {card.badge2 && <span className="meta-chip">{card.badge2}</span>}
                    {card.badge3 && <span className="meta-chip">{card.badge3}</span>}
                  </div>
                </article>
              ))
            ) : (
              <>
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
              </>
            )}
          </div>
        </section>

        <section className="tile-grid">
          {(featureTiles && featureTiles.length > 0) ? (
            featureTiles.map((tile) => (
              <article className="tile" key={tile.id}>
                <div className="tile-hero" style={{ backgroundImage: `url('${tile.imageUrl || IMAGES.heroMain}')` }}>
                  <h3>{tile.title}</h3>
                </div>
                <div className="tile-body">
                  <p>{tile.description}</p>
                  <a className="tile-link" href={tile.href}>
                    {tile.title === "Forum" && "Åbn forum"}
                    {tile.title === "Galleri" && "Åbn galleri"}
                    {tile.title === "Flyveskole" && "Se flyveskolen"}
                    {tile.title.startsWith("Om ") && "Læs om klubben"}
                    {!(tile.title === "Forum" || tile.title === "Galleri" || tile.title === "Flyveskole" || tile.title.startsWith("Om ")) && "Læs mere"}
                  </a>
                </div>
              </article>
            ))
          ) : (
            <>
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
            </>
          )}
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
                <p className="small">{(flightIntents?.length || 0) > 0 ? `${flightIntents?.length} medlemmer har meldt “jeg flyver” i dag.` : "Der er endnu ingen der har meldt deres ankomst i dag."} Når første medlem melder sig, skifter gribben status og beskeden sendes til den valgte mailingliste.</p>
                <div className="hero-actions" style={{ marginTop: '14px' }}>
                  {/* Submit flow requires future auth/member implementation */}
                  {/* Future submit flow must allow selecting today or a future date */}
                  <a className="pill primary" href="#">Skriv “jeg flyver”</a>
                  <a className="pill" href="#">Se dagens liste</a>
                </div>
              </div>
            </div>

            <div className="list">
              {flightIntents && flightIntents.length > 0 ? (
                flightIntents.map((intent) => (
                  <div className="row-item" key={intent.id}>
                    <div className="row-icon">{activityIcons[intent.activityType] || '•'}</div>
                    <div>
                      <div className="row-title">{intent.displayName}</div>
                      {intent.message && <div className="row-sub">“{intent.message}”</div>}
                    </div>
                    <span className="status-badge info">{formatTime(intent.createdAt)}</span>
                  </div>
                ))
              ) : (
                <>
                  {/* Placeholder fallback if no flight intents exist */}
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
                </>
              )}
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
            {footerData?.footer ? (
              <>
                {footerData.footer.description && <p className="small" style={{ marginTop: '10px' }}>{footerData.footer.description}</p>}
                <div className="sponsors">
                  {footerData.sponsors.map(sponsor => (
                    <span key={sponsor.id} className="sponsor">
                      {sponsor.href ? (
                        <a href={sponsor.href} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                          {sponsor.name}
                        </a>
                      ) : (
                        sponsor.name
                      )}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="small" style={{ marginTop: '10px' }}>Ny forside mockup med mere visuel struktur og tydeligere indgange til de vigtigste områder: aktivitet, forum, galleri, flyveskole og klubinformation.</p>
                <div className="sponsors">
                  {/* Placeholder: Sponsors */}
                  <span className="sponsor">Ellehammerfonden</span>
                  <span className="sponsor">Friluftsrådet</span>
                  <span className="sponsor">Dane-RC</span>
                </div>
              </>
            )}
          </div>
          <div>
            <h3>Kontakt</h3>
            {footerData?.footer ? (
              <>
                <p className="small" style={{ marginTop: '10px' }}>
                  {footerData.footer.addressLine1}{footerData.footer.addressLine1 && footerData.footer.addressLine2 && ', '}
                  {footerData.footer.addressLine2}
                </p>
                <p className="small" style={{ marginTop: '10px' }}>
                  {footerData.footer.email}<br />
                  {footerData.footer.phone && <>{footerData.footer.phone}<br /></>}
                  {footerData.footer.cvr && <>CVR {footerData.footer.cvr}</>}
                </p>
              </>
            ) : (
              <>
                <p className="small" style={{ marginTop: '10px' }}>{clubName}, Flyvestation Værløse, Shelter 331, 3500 Værløse</p>
                <p className="small" style={{ marginTop: '10px' }}>kontakt@efk87.dk<br />CVR 12345678</p>
              </>
            )}
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
