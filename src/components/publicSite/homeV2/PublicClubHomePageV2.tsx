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
import { ClubForumThread, ClubForumCategory, PublicClubFooter, PublicSponsor } from '../../../generated/prisma';
import { WeatherData } from '../../../lib/weather/openMeteoWeatherService';
import { HomepageContentWithSignups } from '../../../lib/homepageContent/homepageContentService';
import { FlightSchoolHomepageViewModel } from '../../../lib/flightSchool/flightSchoolBookingService';
import { publicRoutes } from '../../../lib/publicRoutes';
import HomepageContentBoxes from './HomepageContentBoxes';
import Avatar from '../../shared/Avatar';

type ThreadWithRelations = ClubForumThread & {
  category: ClubForumCategory;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    memberProfiles: {
      firstName: string | null;
      lastName: string | null;
    }[];
  };
  replies: {
    author: {
      id: string;
      name: string | null;
      image: string | null;
      memberProfiles: {
        firstName: string | null;
        lastName: string | null;
      }[];
    };
  }[];
};

import { normalizePublicThemeMode } from '../../../lib/publicSite/publicThemeService';

interface PublicClubHomePageV2Props {
  club: {
    id: string;
    name: string;
    slug: string;
    settings?: {
      displayName: string;
      shortName: string;
      publicEmail: string | null;
      publicThemeMode: string;
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
  flightSchoolHomepage: FlightSchoolHomepageViewModel;
  weather?: WeatherData | null;
  footerData?: {
    footer: PublicClubFooter | null;
    sponsors: PublicSponsor[];
  };
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
 * Renders public homepage with tenant data.
 */
export default function PublicClubHomePageV2({ club, viewer, todayFlightIntents, memberActivity, navigationItems, actionItems, newMemberHighlights, calendarMarquee, latestForumActivity, homepageContents, flightSchoolHomepage, weather, footerData }: PublicClubHomePageV2Props) {
  const clubDisplayName = club.settings?.displayName || club.name;
  const clubShortName = club.settings?.shortName || club.name;
  const firstName = viewer.firstName || viewer.name?.split(' ')[0] || 'Gæst';
  const todayFlyingCount = todayFlightIntents.length;

  const publicThemeMode = normalizePublicThemeMode(club.settings?.publicThemeMode);

  return (
    <div className="home-v2-root" data-theme={publicThemeMode}>
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
            <div className="home-v2-hero-header">
              <div className="home-v2-hero-text">
                <h1>Hej {firstName}.{todayFlyingCount > 0 ? ' Der er liv på pladsen i dag.' : ''}</h1>
                <p className="home-v2-hero-copy">
                  {todayFlightIntents.length} medlemmer har allerede meldt “jeg flyver”.
                </p>
              </div>
            </div>
            <div className="home-v2-inline-actions">
              <Link className="home-v2-pill home-v2-primary" href={publicRoutes.jegFlyver(club.slug)}>Jeg flyver</Link>
              <Link className="home-v2-pill" href={publicRoutes.becomeMember(club.slug)}>Bliv medlem</Link>
              <Link className="home-v2-pill" href={publicRoutes.home(club.slug) + '/kalender'}>Åbn kalender</Link>
              <Link className="home-v2-pill" href={publicRoutes.flightSchool(club.slug)}>Gå til flyveskole</Link>
              <Link className="home-v2-pill" href={publicRoutes.gallery(club.slug)}>Upload billeder</Link>
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
                  <Link href={publicRoutes.calendarEntry(club.slug, entry.id)} className="home-v2-marquee-item">
                    <span className="home-v2-marquee-date">{dateDisplay}</span>
                    <span className="home-v2-marquee-title">{entry.title}</span>
                    {hasTime && <span className="home-v2-marquee-time">{timeDisplay}</span>}
                  </Link>
                  <span className="home-v2-marquee-separator">
                     <div className="home-v2-marquee-logo-mark">{clubShortName}</div>
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
            <HomepageContentBoxes
                clubSlug={club.slug}
                contents={homepageContents}
                viewer={viewer}
            />
            <article className="home-v2-card home-v2-section-card">
              <div className="home-v2-section-head">
                <h2>Forum – seneste aktivitet</h2>
                <Link className="home-v2-link-soft" href={publicRoutes.forum(club.slug)}>Åbn forum</Link>
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
                        href={publicRoutes.forumThread(club.slug, thread.category.slug, thread.slug)}
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
                <Link className="home-v2-link-soft" href={publicRoutes.gallery(club.slug)}>Åbn galleri</Link>
              </div>
              <div className="home-v2-gallery-grid">
                <Link href={publicRoutes.gallery(club.slug)} className="home-v2-gallery-item">
                  <div className="home-v2-gallery-image" style={{backgroundImage: "url('https://images.unsplash.com/photo-1508615070457-7baeba4003ab?auto=format&fit=crop&w=900&q=80')"}} />
                  <div className="home-v2-gallery-label">ASW-28 · I dag</div>
                </Link>
                <Link href={publicRoutes.gallery(club.slug)} className="home-v2-gallery-item">
                  <div className="home-v2-gallery-image" style={{backgroundImage: "url('https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&w=900&q=80')"}} />
                  <div className="home-v2-gallery-label">Klubpladsen</div>
                </Link>
                <Link href={publicRoutes.gallery(club.slug)} className="home-v2-gallery-item">
                  <div className="home-v2-gallery-image" style={{backgroundImage: "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80')"}} />
                  <div className="home-v2-gallery-label">Skoleflyvning</div>
                </Link>
                <Link href={publicRoutes.gallery(club.slug)} className="home-v2-gallery-item">
                  <div className="home-v2-gallery-image" style={{backgroundImage: "url('https://images.unsplash.com/photo-1496449903678-68ddcb189a24?auto=format&fit=crop&w=900&q=80')"}} />
                  <div className="home-v2-gallery-label">Skræntdag</div>
                </Link>
                <Link href={publicRoutes.gallery(club.slug)} className="home-v2-gallery-item">
                  <div className="home-v2-gallery-image" style={{backgroundImage: "url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=900&q=80')"}} />
                  <div className="home-v2-gallery-label">Klubhuset</div>
                </Link>
                <Link href={publicRoutes.gallery(club.slug)} className="home-v2-gallery-item">
                  <div className="home-v2-gallery-image" style={{backgroundImage: "url('https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80')"}} />
                  <div className="home-v2-gallery-label">Solnedgang</div>
                </Link>
              </div>
            </article>
          </div>

          <div className="home-v2-stack">



            <article className="home-v2-card home-v2-section-card">
              <div className="home-v2-section-head">
                <h2>Aktivitet på pladsen</h2>
                <Link className="home-v2-link-soft" href={publicRoutes.jegFlyverList(club.slug)}>Se alle flyvemeddelser</Link>
              </div>

              <div className="home-v2-griffin">
                <div className="home-v2-griffin-emoji">
                  <img
                    src={todayFlightIntents.length > 0 ? `/images/clubs/${club.slug}/vi_flyver.gif` : `/images/clubs/${club.slug}/vi_flyver_ikke.gif`}
                    alt={todayFlightIntents.length > 0 ? 'Gribben flyver' : 'Gribben sover'}
                    style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
                  />
                </div>
                <div>
                  <h3>{todayFlightIntents.length > 0 ? 'Gribben basker – der er aktivitet i dag' : 'Gribben sover – ingen har meldt deres ankomst endnu'}</h3>
                  <p className="home-v2-row-sub">
                    {todayFlightIntents.length > 0
                        ? `Der er i øjeblikket ${todayFlightIntents.length} medlemmer der har meldt deres ankomst til pladsen i dag.`
                        : 'Bliv den første til at melde din ankomst til pladsen i dag.'}
                  </p>
                  <div className="home-v2-activity-actions">
                    <Link
                        href={publicRoutes.jegFlyver(club.slug)}
                        className="home-v2-activity-cta home-v2-activity-cta-primary"
                    >
                      Skriv “jeg flyver”
                    </Link>
                    <Link
                        href={publicRoutes.jegFlyverList(club.slug)}
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
                        <div key={idx} className="home-v2-online-row flex items-center gap-3">
                          <Avatar 
                            name={member.displayName} 
                            imageUrl={member.profileImageUrl} 
                            size="sm" 
                            className="w-6 h-6"
                          />
                          <span className="home-v2-online-time">
                            {member.lastSeenAt.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="home-v2-online-name">
                            {member.displayName}
                          </span>
                        </div>
                    ))
                ) : (
                    <div className="home-v2-compact-empty">Ingen medlemmer online lige nu</div>
                )}
              </div>

              <div className="home-v2-stat-footer">
                <small>{memberActivity.todayActiveCount} medlemmer aktive i dag</small>
              </div>
            </article>

            <article className="home-v2-card home-v2-section-card">
              <div className="home-v2-section-head">
                <h2>✈️ Skoleflyvning i dag</h2>
              </div>
              
              {!flightSchoolHomepage.hasSessionsToday ? (
                <div className="home-v2-compact-empty" style={{ padding: '12px 0' }}>
                  Ingen skoleflyvning i dag
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="home-v2-mini-grid">
                    <div className="home-v2-mini-card" style={{ padding: '12px' }}>
                      <div className="home-v2-muted" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>I dag</div>
                      <div className="home-v2-row-sub" style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px 16px', fontSize: '13px' }}>
                        <span>👨‍✈️ {flightSchoolHomepage.totalInstructors} {flightSchoolHomepage.totalInstructors === 1 ? 'instruktør' : 'instruktører'}</span>
                        <span>👥 {flightSchoolHomepage.totalBookedStudents} {flightSchoolHomepage.totalBookedStudents === 1 ? 'elev' : 'elever'}</span>
                        {flightSchoolHomepage.totalAvailableSlots > 0 && (
                          <span className="text-emerald-400">🟢 {flightSchoolHomepage.totalAvailableSlots} ledige</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="home-v2-online-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {flightSchoolHomepage.sessions.map((session) => (
                      <div key={session.id} className="home-v2-online-row" style={{ padding: '6px 0', borderBottom: '1px solid var(--home-v2-line-soft)', fontSize: '13px', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 500 }}>
                          {session.instructorName}
                          {' '}·{' '}
                        </span>
                        <span className="home-v2-muted">
                          {session.startTime?.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}–{session.endTime?.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit'})}
                          {' '}·{' '}
                          {session.bookedSlots}/{session.totalActiveSlots} tider booket
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {flightSchoolHomepage.upcomingDays.length > 0 && (
                <div style={{ marginTop: '20px', borderTop: '1px solid var(--home-v2-line)', paddingTop: '16px' }}>
                  <div className="home-v2-muted" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>📅 <b>næste skoledage</b></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {flightSchoolHomepage.upcomingDays.map((day, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', padding: '4px 0' }}>
                        <span style={{ textTransform: 'capitalize' }}>
                          {day.date.toLocaleDateString('da-DK', { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', '')}
                        </span>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <span className="home-v2-muted">{day.instructorCount} {day.instructorCount === 1 ? 'instruktør' : 'instruktører'}</span>
                          {day.availableSlots > 0 ? (
                            <span className="text-emerald-400" style={{ fontSize: '12px' }}>{day.availableSlots} ledige</span>
                          ) : (
                            <span className="home-v2-muted" style={{ fontSize: '12px' }}>Fuldt booket</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="home-v2-cta-row" style={{ marginTop: '20px' }}>
                <Link className="home-v2-pill home-v2-primary" href={`/${club.slug}/flyveskole/skolekalender`}>
                  Se skolekalender
                </Link>
              </div>
            </article>

            <article className="home-v2-card home-v2-section-card">
              <div className="home-v2-section-head">
                <h2>Klubchat</h2>
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
                <Link className="home-v2-pill home-v2-primary" href={publicRoutes.forum(club.slug)}>Skriv i chatten</Link>
                <Link className="home-v2-pill" href={publicRoutes.forum(club.slug)}>Se alle beskeder</Link>
              </div>
            </article>

            <article className="home-v2-card home-v2-section-card">
              <div className="home-v2-section-head">
                <h2>Hurtige genveje</h2>
              </div>
              <div className="home-v2-quick-list">
                <Link className="home-v2-row-item" href={publicRoutes.about(club.slug)}>
                  <div className="home-v2-row-icon">📜</div>
                  <div>
                    <div className="home-v2-row-title">Vedtægter</div>
                    <div className="home-v2-row-sub">Klubbens formelle vedtægter og rammer for medlemskab</div>
                  </div>
                  <span className="home-v2-status-badge home-v2-info">Åbn</span>
                </Link>
                <Link className="home-v2-row-item" href={publicRoutes.about(club.slug)}>
                  <div className="home-v2-row-icon">⚠️</div>
                  <div>
                    <div className="home-v2-row-title">Pladsregler</div>
                    <div className="home-v2-row-sub">Sikkerhed, flyvning, brug af bane og fælles regler på pladsen</div>
                  </div>
                  <span className="home-v2-status-badge home-v2-info">Åbn</span>
                </Link>
                <Link className="home-v2-row-item" href={publicRoutes.flightSchoolCalendar(club.slug)}>
                  <div className="home-v2-row-icon">🗓️</div>
                  <div>
                    <div className="home-v2-row-title">Skolekalender</div>
                    <div className="home-v2-row-sub">Se planlagte skoleflyvninger, tider og dagens instruktion</div>
                  </div>
                  <span className="home-v2-status-badge home-v2-info">Åbn</span>
                </Link>
              </div>
            </article>
          </div>
        </section>

        <footer className="home-v2-card home-v2-footer">
          <div>
            <h3>{clubShortName}</h3>
            {footerData?.footer ? (
              <>
                {footerData.footer.description && (
                  <p className="home-v2-small" style={{marginTop: '10px'}}>
                    {footerData.footer.description}
                  </p>
                )}
                {footerData.sponsors.length > 0 && (
                  <div className="home-v2-sponsors">
                    {footerData.sponsors.map(sponsor => (
                      <span key={sponsor.id} className="home-v2-sponsor">
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
                  <p className="home-v2-small" style={{marginTop: '10px'}}>
                    {footerData.footer.addressLine1}{footerData.footer.addressLine1 && footerData.footer.addressLine2 && ', '}
                    {footerData.footer.addressLine2}
                  </p>
                )}
                <p className="home-v2-small" style={{marginTop: '10px'}}>
                  {footerData.footer.email && <>{footerData.footer.email}<br/></>}
                  {footerData.footer.phone && <>{footerData.footer.phone}<br/></>}
                  {footerData.footer.cvr && <>CVR {footerData.footer.cvr}</>}
                </p>
              </>
            ) : (
              <p className="home-v2-small" style={{marginTop: '10px'}}>
                {clubDisplayName}
                {club.settings?.publicEmail && <><br/>{club.settings.publicEmail}</>}
              </p>
            )}
          </div>
          <div>
            <h3>Links</h3>
            <p className="home-v2-small" style={{marginTop: '10px'}}>
              <Link href={publicRoutes.forum(club.slug)} style={{ color: 'inherit', textDecoration: 'none' }}>Forum</Link><br/>
              <Link href={publicRoutes.gallery(club.slug)} style={{ color: 'inherit', textDecoration: 'none' }}>Galleri</Link><br/>
              <Link href={publicRoutes.flightSchool(club.slug)} style={{ color: 'inherit', textDecoration: 'none' }}>Flyveskole</Link><br/>
              <Link href={publicRoutes.about(club.slug)} style={{ color: 'inherit', textDecoration: 'none' }}>Om {clubShortName}</Link>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
