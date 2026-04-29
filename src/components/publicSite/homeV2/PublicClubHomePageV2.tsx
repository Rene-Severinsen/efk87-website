import React from 'react';
import './PublicClubHomePageV2.css';
import { PublicFlightIntentListItem } from '../../../lib/publicSite/publicFlightIntentService';
import { MemberActivityStats } from '../../../lib/memberActivity/memberActivityService';
import { ServerViewerContext } from '../../../lib/auth/viewer';
import { PublicNavigationItem } from '../../../lib/publicSite/publicNavigation';
import { NewMemberHighlightData } from '../../../lib/members/newMemberHighlightService';
import NewMembersHighlightCard from '../../club/NewMembersHighlightCard';
import Link from 'next/link';
import { ThemedTopBar } from '../ThemedTopBar';

interface PublicClubHomePageV2Props {
  club: {
    id: string;
    name: string;
    slug: string;
    settings?: {
      displayName: string;
      shortName: string;
      publicEmail: string | null;
    } | null;
  };
  viewer: ServerViewerContext;
  todayFlightIntents: PublicFlightIntentListItem[];
  memberActivity: MemberActivityStats;
  navigationItems: PublicNavigationItem[];
  actionItems: PublicNavigationItem[];
  newMemberHighlights: NewMemberHighlightData;
  theme?: {
    backgroundColor: string;
    panelColor: string;
    panelSoftColor: string;
    lineColor: string;
    textColor: string;
    mutedTextColor: string;
    accentColor: string;
    accentColor2: string;
    shadowValue: string;
    radiusValue: string;
    heroImageUrl: string | null;
  } | null;
}

/**
 * PublicClubHomePageV2 - Isolated V2 homepage component.
 * Ported closely from the provided mockup HTML.
 */
export default function PublicClubHomePageV2({ club, viewer, todayFlightIntents, memberActivity, navigationItems, actionItems, newMemberHighlights }: PublicClubHomePageV2Props) {
  const clubDisplayName = club.settings?.displayName || club.name;
  const clubShortName = club.settings?.shortName || club.name;

  const formatDate = (date: Date) => {
    return date.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
  };

  const getEmojiForActivity = (type: string) => {
    switch (type) {
      case 'FLYING': return '✈️';
      case 'MAINTENANCE': return '🛠️';
      case 'WEATHER_DEPENDENT': return '🌬️';
      case 'TRAINING': return '🎓';
      case 'SOCIAL': return '☕';
      default: return '📍';
    }
  };

  return (
    <div className="home-v2-root">
      <div className="home-v2-shell">
        <ThemedTopBar
          clubSlug={club.slug}
          clubName={clubShortName}
          clubDisplayName={clubDisplayName}
          navigationItems={navigationItems}
          actionItems={actionItems}
          currentPath={`/${club.slug}`}
        />

        <section className={`home-v2-hero ${newMemberHighlights.visible ? 'home-v2-hero-top--split' : 'home-v2-hero-top--full'}`}>
          <article className="home-v2-card home-v2-hero-main">
            <div className="home-v2-eyebrow">
              ✈️ Sæsonstart 2026 · {new Date().toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' })} · Vejr: 8°C og let sidevind
            </div>
            <h1>Hej {viewer.name?.split(' ')[0] || 'Gæst'}. Der er liv på pladsen i dag.</h1>
            <p className="home-v2-hero-copy">
              {todayFlightIntents.length} medlemmer har allerede meldt “jeg flyver”, skoleflyvning er <strong>aktiv fra kl. 11:00</strong>, og forumtråden om forårsoprydning har fået 9 nye svar siden i går.
            </p>
            <div className="home-v2-inline-actions">
              <Link className="home-v2-pill home-v2-primary" href={`/${club.slug}/jeg-flyver`}>Jeg flyver i dag</Link>
              <a className="home-v2-pill" href="#">Åbn kalender</a>
              <a className="home-v2-pill" href="#">Gå til flyveskole</a>
              <a className="home-v2-pill" href="#">Upload billeder</a>
            </div>
          </article>

          {newMemberHighlights.visible ? (
            <div className="home-v2-side-stack">
              <NewMembersHighlightCard clubName={clubDisplayName} members={newMemberHighlights.members} />
            </div>
          ) : null}
        </section>

        <section className="home-v2-marquee-row">
          <article className="home-v2-card home-v2-marquee-card">
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
        </section>

        <section className="home-v2-stats-row">
          <article className="home-v2-card home-v2-stat">
            <div className="home-v2-top">
              <small>Senest online</small>
              <span className="home-v2-status-badge home-v2-info">I dag</span>
            </div>
            
            <div className="home-v2-online-list">
              {memberActivity.latestMembers.length > 0 ? (
                memberActivity.latestMembers.map((member, idx) => (
                  <div key={idx} className="home-v2-online-row">
                    <span className="home-v2-online-time">
                      {member.lastSeenAt.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="home-v2-online-name">
                      {member.displayName}
                    </span>
                  </div>
                ))
              ) : (
                <div className="home-v2-compact-empty">Ingen aktivitet endnu</div>
              )}
            </div>

            <div className="home-v2-stat-footer">
              <small>{memberActivity.todayActiveCount} medlemmer aktive i dag</small>
            </div>
          </article>
          <article className="home-v2-card home-v2-stat">
            <div className="home-v2-top">
              <small>“Jeg flyver” i dag</small>
              <span className="home-v2-status-badge home-v2-ok">Aktiv</span>
            </div>
            <div className="home-v2-value">{todayFlightIntents.length}</div>
            <small>Seneste opdatering kl. {new Date().toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}</small>
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
                <Link className="home-v2-link-soft" href={`/${club.slug}/jeg-flyver/liste`}>Se alle flyvemeddelser</Link>
              </div>

              <div className="home-v2-griffin">
                <div className="home-v2-griffin-emoji">{todayFlightIntents.length > 0 ? '🦅' : '💤'}</div>
                <div>
                  <h3>{todayFlightIntents.length > 0 ? 'Gribben basker – der er aktivitet i dag' : 'Gribben sover – ingen har meldt deres ankomst endnu'}</h3>
                  <p className="home-v2-row-sub">
                    {todayFlightIntents.length > 0 
                      ? `Der er i øjeblikket ${todayFlightIntents.length} medlemmer der har meldt deres ankomst til pladsen i dag.`
                      : 'Bliv den første til at melde din ankomst til pladsen i dag.'}
                  </p>
                  <div className="home-v2-activity-actions">
                    <Link
                      href={`/${club.slug}/jeg-flyver`}
                      className="home-v2-activity-cta home-v2-activity-cta-primary"
                    >
                      Skriv “jeg flyver”
                    </Link>
                    <Link
                      href={`/${club.slug}/jeg-flyver/liste`}
                      className="home-v2-activity-cta home-v2-activity-cta-secondary"
                    >
                      Se dagens liste
                    </Link>
                  </div>
                </div>
              </div>

              <div className="home-v2-activity-list">
                {todayFlightIntents.length > 0 ? (
                  todayFlightIntents.map((intent) => (
                    <div key={intent.id} className="home-v2-row-item">
                      <div className="home-v2-row-icon">{getEmojiForActivity(intent.activityType)}</div>
                      <div>
                        <div className="home-v2-row-title">{intent.displayName}</div>
                        <div className="home-v2-row-sub">{intent.message || 'Kommer på pladsen.'}</div>
                      </div>
                      <span className="home-v2-status-badge home-v2-info">{formatDate(new Date(intent.createdAt))}</span>
                    </div>
                  ))
                ) : (
                  <div className="home-v2-muted" style={{ padding: '20px', textAlign: 'center' }}>Ingen aktivitet meldt endnu</div>
                )}
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
                    <div className="home-v2-row-sub">4 nye svar · Sidste svar for 43 min siden</div>
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
            <h3>{clubShortName}</h3>
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
            <p className="home-v2-small" style={{marginTop: '10px'}}>{clubDisplayName}</p>
            <p className="home-v2-small" style={{marginTop: '10px'}}>{club.settings?.publicEmail || 'kontakt@efk87.dk'}<br/>CVR 12345678</p>
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
