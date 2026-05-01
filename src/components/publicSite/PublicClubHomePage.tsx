import React from 'react';
import Link from 'next/link';
import './PublicClubHomePage.css';
import { ThemedTopBar } from './ThemedTopBar';
import { ClubTheme, PublicHomeFeatureTile, PublicHomeInfoCard, PublicClubFooter, PublicSponsor } from "../../generated/prisma";
import { PublicNavigationItem } from "../../lib/publicSite/publicNavigation";
import { PublicFlightIntentListItem } from "../../lib/publicSite/publicFlightIntentService";
import Avatar from '../shared/Avatar';

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
  clubSlug: string;
  clubName: string;
  clubDisplayName: string;
  content: PublicHomePageData;
  theme?: ClubTheme;
  featureTiles?: PublicHomeFeatureTile[];
  infoCards?: PublicHomeInfoCard[];
  flightIntents?: PublicFlightIntentListItem[];
  footerData?: PublicFooterData;
  navigationItems?: PublicNavigationItem[];
  actionItems?: PublicNavigationItem[];
  submitFlightIntentHref?: string;
  viewAllFlightIntentsHref?: string;
}

/**
 * PublicClubHomePage - Renders public homepage with tenant data.
 */
export default function PublicClubHomePage({ 
  clubSlug,
  clubName, 
  clubDisplayName, 
  content, 
  theme, 
  featureTiles, 
  infoCards, 
  flightIntents, 
  footerData,
  navigationItems = [],
  actionItems = [],
  submitFlightIntentHref = "#",
  viewAllFlightIntentsHref = "#"
}: PublicClubHomePageProps) {
  // Use existing dynamic data
  const heroTitle = content.heroTitle;
  const heroSubtitle = content.heroSubtitle;
  
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
        <ThemedTopBar 
          clubSlug={clubSlug}
          clubName={clubName}
          clubDisplayName={clubDisplayName}
          navigationItems={navigationItems}
          actionItems={actionItems}
          currentPath={`/${clubSlug}`}
        />

        <section className="hero-grid">
          <article className="card hero-main" style={{ backgroundImage: `linear-gradient(180deg, rgba(6,10,18,0.18), rgba(6,10,18,0.84)), url('${IMAGES.heroMain}')` }}>
            <div className="eyebrow">✈️ Søndag 29. marts · Aktivitet på pladsen · Skoleflyvning i dag</div>
            <h1>{heroTitle}</h1>
            <p className="hero-copy">{heroSubtitle}</p>
            <div className="hero-actions">
              <Link className="pill primary" href={`/${clubSlug}/jeg-flyver`}>Jeg flyver i dag</Link>
              <Link className="pill" href={`/${clubSlug}/bliv-medlem`}>Bliv medlem</Link>
              <a className="pill" href="#">Se flyveskolen</a>
              <a className="pill" href="#">Åbn galleri</a>
            </div>
          </article>

          <div className="side-stack">
            {infoCards && infoCards.length > 0 && (
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
            )}
          </div>
        </section>

        <section className="tile-grid">
          {featureTiles && featureTiles.length > 0 && (
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
          )}
        </section>

        <section className="activity-layout">
          <article className="card section-card">
            <div className="section-head">
              <h2>Aktivitet på pladsen</h2>
              <a className="link-soft" href={viewAllFlightIntentsHref}>Se alle flyvemeddelser</a>
            </div>

            <div className="griffin-box">
              <div className="griffin">🦅</div>
              <div>
                <h3>Gribben basker – der er aktivitet i dag</h3>
                <p className="small">{(flightIntents?.length || 0) > 0 ? `${flightIntents?.length} medlemmer har meldt “jeg flyver” i dag.` : "Der er endnu ingen der har meldt deres ankomst i dag."} Når første medlem melder sig, skifter gribben status og beskeden sendes til den valgte mailingliste.</p>
                <div className="hero-actions" style={{ marginTop: '14px' }}>
                  {/* Submit flow requires future auth/member implementation */}
                  {/* Future submit flow must allow selecting today or a future date */}
                  <a className="pill primary" href={submitFlightIntentHref}>Skriv “jeg flyver”</a>
                  <a className="pill" href={viewAllFlightIntentsHref}>Se dagens liste</a>
                </div>
              </div>
            </div>

            <div className="list">
              {flightIntents && flightIntents.length > 0 ? (
                flightIntents.map((intent) => (
                  <div className="row-item" key={intent.id}>
                    <div className="relative shrink-0 mr-3">
                      <Avatar 
                        name={intent.displayName} 
                        imageUrl={intent.profileImageUrl} 
                        size="sm" 
                        className="w-8 h-8"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-[var(--club-panel)] border border-[var(--club-line)] text-[8px]">
                        {activityIcons[intent.activityType] || '•'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="row-title truncate">{intent.displayName}</div>
                      {intent.message && <div className="row-sub truncate">“{intent.message}”</div>}
                    </div>
                    <span className="status-badge info">{formatTime(intent.createdAt)}</span>
                  </div>
                ))
              ) : (
                <div className="row-item">
                  <div className="row-icon">ℹ️</div>
                  <div>
                    <div className="row-title">Ingen flyvemeldinger</div>
                    <div className="row-sub">Der er ikke registreret nogen flyvemeldinger for i dag endnu.</div>
                  </div>
                </div>
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
              {/* Forum activity renders here if available */}
            </div>
            </article>

            <article className="card section-card">
              <div className="section-head">
                <h2>Socialt og visuelt liv</h2>
              </div>

              <div className="social-grid">
                {/* Social items render here if available */}
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
                {footerData.sponsors.length > 0 && (
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
                )}
              </>
            ) : null}
          </div>
          <div>
            <h3>Kontakt</h3>
            {footerData?.footer ? (
              <>
                {(footerData.footer.addressLine1 || footerData.footer.addressLine2) && (
                  <p className="small" style={{ marginTop: '10px' }}>
                    {footerData.footer.addressLine1}{footerData.footer.addressLine1 && footerData.footer.addressLine2 && ', '}
                    {footerData.footer.addressLine2}
                  </p>
                )}
                <p className="small" style={{ marginTop: '10px' }}>
                  {footerData.footer.email && <>{footerData.footer.email}<br /></>}
                  {footerData.footer.phone && <>{footerData.footer.phone}<br /></>}
                  {footerData.footer.cvr && <>CVR {footerData.footer.cvr}</>}
                </p>
              </>
            ) : (
              <p className="small" style={{ marginTop: '10px' }}>{clubName}</p>
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
