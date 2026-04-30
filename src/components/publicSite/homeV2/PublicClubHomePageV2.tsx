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
import { PublicCalendarEntry } from '../../../lib/publicSite/publicCalendarService';
import { getMemberDisplayName } from '../../member/MemberDisplayName';
import { getForumReplyBadge } from '../../../lib/forum/forumHelpers';
import ForumIcon from '../../forum/ForumIcon';
import ForumReplyBadge from '../../forum/ForumReplyBadge';
import { ClubForumThread, ClubForumCategory } from '../../../generated/prisma';
import { WeatherData } from '../../../lib/weather/openMeteoWeatherService';
import { HomepageContentWithSignups } from '../../../lib/homepageContent/homepageContentService';
import HomepageContentBoxes from './HomepageContentBoxes';

type ThreadWithRelations = ClubForumThread & {
  category: ClubForumCategory;
  author: {
    id: string;
    name: string | null;
    memberProfiles: {
      firstName: string | null;
      lastName: string | null;
    }[];
  };
  replies: {
    author: {
      id: string;
      name: string | null;
      memberProfiles: {
        firstName: string | null;
        lastName: string | null;
      }[];
    };
  }[];
};

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
  calendarMarquee: PublicCalendarEntry[];
  latestForumActivity: ThreadWithRelations[];
  homepageContents: HomepageContentWithSignups[];
  weather?: WeatherData | null;
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
export default function PublicClubHomePageV2({ club, viewer, todayFlightIntents, memberActivity, navigationItems, actionItems, newMemberHighlights, calendarMarquee, latestForumActivity, homepageContents, weather, theme }: PublicClubHomePageV2Props) {
  const clubDisplayName = club.settings?.displayName || club.name;
  const clubShortName = club.settings?.shortName || club.name;
  const firstName = viewer.firstName || viewer.name?.split(' ')[0] || 'Gæst';
  const todayFlyingCount = todayFlightIntents.length;


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
              {new Date().toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' })}
              {weather ? (
                <> · Vejr: {weather.temp}°C, {weather.wind} m/s fra {weather.direction} · {weather.shortComment}</>
              ) : (
                <> · Vejr: Henter...</>
              )}
            </div>
            <h1>Hej {firstName}.{todayFlyingCount > 0 ? ' Der er liv på pladsen i dag.' : ''}</h1>
            <p className="home-v2-hero-copy">
              {todayFlightIntents.length} medlemmer har allerede meldt “jeg flyver”.
            </p>
            <div className="home-v2-inline-actions">
              <Link className="home-v2-pill home-v2-primary" href={`/${club.slug}/jeg-flyver`}>Jeg flyver</Link>
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
                {calendarMarquee.length > 0 ? (
                  <>
                    {[...calendarMarquee, ...calendarMarquee, ...calendarMarquee, ...calendarMarquee].map((entry, idx) => {
                      const dateDisplay = entry.startsAt.toLocaleDateString('da-DK', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      });
                      const hasTime = entry.startsAt.getHours() !== 0 || entry.startsAt.getMinutes() !== 0;
                      const timeDisplay = hasTime ? entry.startsAt.toLocaleTimeString('da-DK', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '';
                      
                      return (
                        <React.Fragment key={`${entry.id}-${idx}`}>
                          <Link href={`/${club.slug}/kalender/${entry.id}`} className="home-v2-marquee-item">
                            <span className="home-v2-marquee-date">{dateDisplay}</span>
                            <span className="home-v2-marquee-title">{entry.title}</span>
                            {hasTime && <span className="home-v2-marquee-time">{timeDisplay}</span>}
                          </Link>
                          <span className="home-v2-marquee-separator">
                             <div className="home-v2-marquee-logo-mark">EFK87</div>
                          </span>
                        </React.Fragment>
                      );
                    })}
                  </>
                ) : (
                  <span>Ingen kommende kalenderindslag</span>
                )}
              </div>
            </div>
          </article>
        </section>

        <section className="home-v2-layout">
          <div className="home-v2-stack">

            <article className="home-v2-card home-v2-section-card">
              <div className="home-v2-section-head">
                <HomepageContentBoxes
                    clubSlug={club.slug}
                    contents={homepageContents}
                    viewer={viewer}
                />
              </div>
            </article>

            <article className="home-v2-card home-v2-section-card">
              <div className="home-v2-section-head">
                <h2>Forum – seneste aktivitet</h2>
                <Link className="home-v2-link-soft" href={`/${club.slug}/forum`}>Åbn forum</Link>
              </div>
              <div className="home-v2-thread-list">
                {latestForumActivity.length === 0 ? (
                  <div className="home-v2-compact-empty">Ingen aktivitet i forum endnu</div>
                ) : (
                  latestForumActivity.map((thread) => {
                    const latestReply = thread.replies[0];
                    const badge = getForumReplyBadge(thread.replyCount, thread.lastActivityAt);
                    
                    let metaLine = "";
                    if (latestReply) {
                      const authorName = getMemberDisplayName(latestReply.author);
                      metaLine = `${thread.replyCount} svar · Sidste svar af ${authorName}`;
                    } else {
                      const authorName = getMemberDisplayName(thread.author);
                      metaLine = `Ny tråd oprettet af ${authorName} · ${thread.category.title}`;
                    }

                    return (
                      <Link 
                        key={thread.id} 
                        href={`/${club.slug}/forum/${thread.category.slug}/${thread.slug}`}
                        className="home-v2-row-item group"
                      >
                        <div className="home-v2-row-icon flex items-center justify-center">
                          <ForumIcon iconKey={thread.iconKey} className="w-5 h-5" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="home-v2-row-title truncate group-hover:text-sky-400 transition-colors">
                            {thread.title}
                          </div>
                          <div className="home-v2-row-sub truncate">{metaLine}</div>
                        </div>
                        <ForumReplyBadge badge={badge} />
                      </Link>
                    );
                  })
                )}
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
                      Se dagens indtjekninger
                    </Link>
                  </div>
                </div>
              </div>
            </article>

            <article className="home-v2-card home-v2-stat">
              <div className="home-v2-section-head">
                <h2>Senest online</h2>
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
