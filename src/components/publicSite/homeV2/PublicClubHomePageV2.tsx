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
import HomeGalleryToggle from './HomeGalleryToggle';
import { ThemedFooter } from '../ThemedFooter';
import { HomepageGalleryPreviewDTO } from '../../../lib/gallery/galleryService';

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

function resolveClubHref(clubSlug: string, href: string): string {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return href;
  }

  if (href.startsWith("/")) {
    return `/${clubSlug}${href}`;
  }

  return `/${clubSlug}/${href}`;
}

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
      logoUrl: string | null;
      logoAltText: string | null;
      faviconUrl?: string | null;
      appleIconUrl?: string | null;
      publicHeroImageUrl?: string | null;
      publicHeroImageAltText?: string | null;
      publicHeroTitle?: string | null;
      publicHeroSubtitle?: string | null;
      publicHeroPrimaryCtaLabel?: string | null;
      publicHeroPrimaryCtaHref?: string | null;
      publicHeroSecondaryCtaLabel?: string | null;
      publicHeroSecondaryCtaHref?: string | null;
      publicHeroTertiaryCtaLabel?: string | null;
      publicHeroTertiaryCtaHref?: string | null;
      publicHeroQuaternaryCtaLabel?: string | null;
      publicHeroQuaternaryCtaHref?: string | null;
      publicIntroTitle?: string | null;
      publicIntroLinkLabel?: string | null;
      publicIntroLinkHref?: string | null;
      publicIntroCard1Icon?: string | null;
      publicIntroCard1Title?: string | null;
      publicIntroCard1Text?: string | null;
      publicIntroCard1Href?: string | null;
      publicIntroCard2Icon?: string | null;
      publicIntroCard2Title?: string | null;
      publicIntroCard2Text?: string | null;
      publicIntroCard2Href?: string | null;
      publicIntroCard3Icon?: string | null;
      publicIntroCard3Title?: string | null;
      publicIntroCard3Text?: string | null;
      publicIntroCard3Href?: string | null;
      publicCtaSectionTitle?: string | null;
      publicCtaSectionLinkLabel?: string | null;
      publicCtaSectionLinkHref?: string | null;
      publicCtaBoxIcon?: string | null;
      publicCtaBoxTitle?: string | null;
      publicCtaBoxText?: string | null;
      publicCtaPrimaryLabel?: string | null;
      publicCtaPrimaryHref?: string | null;
      publicCtaSecondaryLabel?: string | null;
      publicCtaSecondaryHref?: string | null;
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
  galleryPreview?: HomepageGalleryPreviewDTO;
  weather?: WeatherData | null;
  footerData?: {
    footer: PublicClubFooter | null;
    sponsors: PublicSponsor[];
  };
  surface?: "public" | "member";
  currentPath?: string;
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
 * PublicClubHomePageV2 - Active premium homepage component.
 * Renders public homepage with tenant data.
 */
export default function PublicClubHomePageV2({ club, viewer, todayFlightIntents, memberActivity, navigationItems, actionItems, newMemberHighlights, calendarMarquee, latestForumActivity, homepageContents, flightSchoolHomepage, galleryPreview, weather, footerData, surface = "public", currentPath }: PublicClubHomePageV2Props) {
  const homeLogoUrl = club.settings?.logoUrl ?? null;
  const homeLogoAltText =
    club.settings?.logoAltText || club.settings?.displayName || club.name;

  const safeGalleryPreview = galleryPreview ?? {
    latestImages: [],
    latestAlbums: [],
    publicHomepageAlbums: [],
  };

  const clubDisplayName = club.settings?.displayName || club.name;
  const clubShortName = club.settings?.shortName || club.name;
  const firstName = viewer.firstName || viewer.name?.split(' ')[0] || 'Gæst';
  const todayFlyingCount = todayFlightIntents.length;
  const isMemberDashboard = surface === "member";
  const heroTitle = isMemberDashboard
    ? `Hej ${firstName}.${todayFlyingCount > 0 ? ' Der er liv på pladsen i dag.' : ''}`
    : club.settings?.publicHeroTitle || `Velkommen til ${clubDisplayName}`;
  const heroCopy = isMemberDashboard
    ? `${todayFlightIntents.length} medlemmer har allerede meldt “jeg flyver”.`
    : club.settings?.publicHeroSubtitle || "Modelsvæveflyvning, fællesskab og flyveskole i en aktiv klub med plads til både nye og erfarne piloter.";

  const publicHeroActions = [
    {
      label: club.settings?.publicHeroPrimaryCtaLabel || "Bliv medlem",
      href: club.settings?.publicHeroPrimaryCtaHref || "/bliv-medlem",
      primary: true,
    },
    {
      label: club.settings?.publicHeroSecondaryCtaLabel || "Flyveskole",
      href: club.settings?.publicHeroSecondaryCtaHref || "/flyveskole",
      primary: false,
    },
    {
      label: club.settings?.publicHeroTertiaryCtaLabel || "Se galleri",
      href: club.settings?.publicHeroTertiaryCtaHref || "/galleri",
      primary: false,
    },
    {
      label: club.settings?.publicHeroQuaternaryCtaLabel || "Om klubben",
      href: club.settings?.publicHeroQuaternaryCtaHref || "/about",
      primary: false,
    },
  ];

  const publicIntroCards = [
    {
      icon: club.settings?.publicIntroCard1Icon || "🎓",
      title: club.settings?.publicIntroCard1Title || "Flyveskole",
      text: club.settings?.publicIntroCard1Text || "Kom trygt i gang med instruktører, struktur og hjælp fra første dag.",
      href: club.settings?.publicIntroCard1Href || "/flyveskole",
    },
    {
      icon: club.settings?.publicIntroCard2Icon || "📸",
      title: club.settings?.publicIntroCard2Title || "Fællesskab",
      text: club.settings?.publicIntroCard2Text || "Se billeder og aktiviteter fra et klubmiljø med plads til både nye og erfarne piloter.",
      href: club.settings?.publicIntroCard2Href || "/galleri",
    },
    {
      icon: club.settings?.publicIntroCard3Icon || "📍",
      title: club.settings?.publicIntroCard3Title || "Flyvepladsen",
      text: club.settings?.publicIntroCard3Text || "Find praktisk information om pladsen, klubhuset og hvordan du besøger os.",
      href: club.settings?.publicIntroCard3Href || "/om/her-bor-vi",
    },
  ];

  const publicHeroImageUrl =
    surface === "public" && club.settings?.publicHeroImageUrl
      ? club.settings.publicHeroImageUrl
      : null;

  const publicHeroStyle = publicHeroImageUrl
    ? ({
        "--home-public-hero-image": `url(${JSON.stringify(publicHeroImageUrl)})`,
      } as React.CSSProperties)
    : undefined;

  const publicThemeMode = normalizePublicThemeMode(club.settings?.publicThemeMode);

  return (
    <div className="home-v2-root" data-theme={publicThemeMode} data-surface={surface}>
      <div className="home-v2-shell">
        <ThemedTopBar
          clubSlug={club.slug}
          clubName={clubShortName}
          clubDisplayName={clubDisplayName}
          logoUrl={homeLogoUrl}
          logoAltText={homeLogoAltText}
          navigationItems={navigationItems}
          actionItems={actionItems}
          currentPath={currentPath || `/${club.slug}`}
        />

        <section className={`home-v2-hero ${newMemberHighlights.visible ? 'home-v2-hero-top--split' : 'home-v2-hero-top--full'}`}>
          <article className="home-v2-card home-v2-hero-main" style={publicHeroStyle}>
            {publicHeroImageUrl ? (
              <img
                src={publicHeroImageUrl}
                alt={club.settings?.publicHeroImageAltText || ""}
                className="home-v2-public-hero-image"
              />
            ) : null}
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
                <h1>{heroTitle}</h1>
                <p className="home-v2-hero-copy">
                  {heroCopy}
                </p>
              </div>
            </div>
            <div className="home-v2-inline-actions">
              {isMemberDashboard ? (
                <>
                  <Link className="home-v2-pill home-v2-primary" href={publicRoutes.jegFlyver(club.slug)}>Jeg flyver</Link>
                  <Link className="home-v2-pill" href={publicRoutes.home(club.slug) + '/kalender'}>Åbn kalender</Link>
                  <Link className="home-v2-pill" href={publicRoutes.flightSchoolCalendar(club.slug)}>Skolekalender</Link>
                  <Link className="home-v2-pill" href={publicRoutes.galleryNew(club.slug)}>Upload billeder</Link>
                </>
              ) : (
                <>
                  {publicHeroActions.map((action) => (
                    <Link
                      key={`${action.label}-${action.href}`}
                      className={action.primary ? "home-v2-pill home-v2-primary" : "home-v2-pill"}
                      href={resolveClubHref(club.slug, action.href)}
                    >
                      {action.label}
                    </Link>
                  ))}
                </>
              )}
            </div>
          </article>

          {isMemberDashboard && newMemberHighlights.visible ? (
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
                    <span className="home-v2-marquee-date">
                      {dateDisplay}
                      {hasTime ? ` · ${timeDisplay}` : ""}
                    </span>
                    <span className="home-v2-marquee-title">{entry.title}</span>
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
            {isMemberDashboard ? (
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
                          <div className="home-v2-row-title truncate group-hover:text-[var(--home-primary)] transition-colors">
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
            ) : null}

            {!isMemberDashboard ? (
              <article className="home-v2-card home-v2-section-card home-v2-public-intro">
                <div className="home-v2-section-head">
                  <h2>{club.settings?.publicIntroTitle || "En klub for dig, der vil flyve rigtigt"}</h2>
                  <Link
                    className="home-v2-link-soft"
                    href={resolveClubHref(club.slug, club.settings?.publicIntroLinkHref || "/about")}
                  >
                    {club.settings?.publicIntroLinkLabel || "Læs om klubben"}
                  </Link>
                </div>

                <div className="home-v2-public-intro-grid">
                  {publicIntroCards.map((card) => (
                    <Link
                      key={`${card.title}-${card.href}`}
                      className="home-v2-public-intro-card"
                      href={resolveClubHref(club.slug, card.href)}
                    >
                      <div className="home-v2-row-icon">{card.icon}</div>
                      <div>
                        <h3>{card.title}</h3>
                        <p>{card.text}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </article>
            ) : null}

            {isMemberDashboard ? (
              <HomeGalleryToggle clubSlug={club.slug} galleryPreview={safeGalleryPreview} />
            ) : null}
          </div>

          <div className="home-v2-stack">



            {isMemberDashboard ? (
            <>
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
                          <span className="text-[var(--home-success)]">🟢 {flightSchoolHomepage.totalAvailableSlots} ledige</span>
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
                            <span className="text-[var(--home-success)]" style={{ fontSize: '12px' }}>{day.availableSlots} ledige</span>
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
                <Link className="home-v2-pill home-v2-primary" href={publicRoutes.flightSchoolCalendar(club.slug)}>
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

            </>
            ) : (
            <article className="home-v2-card home-v2-section-card home-v2-public-cta-band">
              <div className="home-v2-section-head">
                <h2>{club.settings?.publicCtaSectionTitle || "Kom i gang med modelflyvning"}</h2>
                <Link className="home-v2-link-soft" href={resolveClubHref(club.slug, club.settings?.publicCtaSectionLinkHref || "/flyveskole")}>{club.settings?.publicCtaSectionLinkLabel || "Læs om flyveskolen"}</Link>
              </div>
              <div className="home-v2-griffin home-v2-public-cta-panel">
                <div className="home-v2-row-icon">{club.settings?.publicCtaBoxIcon || "✈️"}</div>
                <div>
                  <h3>{club.settings?.publicCtaBoxTitle || "Ny i sporten?"}</h3>
                  <p className="home-v2-row-sub">
                    {club.settings?.publicCtaBoxText || "EFK87 har flyveskole, instruktører og et klubmiljø hvor nye medlemmer kan komme trygt i gang."}
                  </p>
                  <div className="home-v2-activity-actions">
                    <Link className="home-v2-activity-cta home-v2-activity-cta-primary" href={resolveClubHref(club.slug, club.settings?.publicCtaPrimaryHref || "/bliv-medlem")}>
                      {club.settings?.publicCtaPrimaryLabel || "Bliv medlem"}
                    </Link>
                    <Link className="home-v2-activity-cta home-v2-activity-cta-secondary" href={resolveClubHref(club.slug, club.settings?.publicCtaSecondaryHref || "/flyveskole")}>
                      {club.settings?.publicCtaSecondaryLabel || "Se flyveskole"}
                    </Link>
                  </div>
                </div>
              </div>
            </article>
            )}

            {!isMemberDashboard && safeGalleryPreview.publicHomepageAlbums.length > 0 ? (
              <article className="home-v2-card home-v2-section-card home-v2-public-gallery-promos">
                <div className="home-v2-section-head">
                  <h2>Udvalgte glimt fra klubben</h2>
                  <Link className="home-v2-link-soft" href={publicRoutes.gallery(club.slug)}>Åbn galleri</Link>
                </div>

                <div className="home-v2-public-gallery-grid">
                  {safeGalleryPreview.publicHomepageAlbums.map((album) => (
                    <Link
                      key={album.id}
                      href={publicRoutes.galleryAlbum(club.slug, album.slug)}
                      className="home-v2-public-gallery-card"
                    >
                      <div className="home-v2-public-gallery-image">
                        {album.coverImageUrl ? (
                          <img src={album.coverImageUrl} alt={album.title} />
                        ) : (
                          <div className="home-v2-public-gallery-placeholder">Galleri</div>
                        )}
                      </div>
                      <div className="home-v2-public-gallery-copy">
                        <h3>{album.title}</h3>
                        {album.description ? <p>{album.description}</p> : null}
                        <span>{album.imageCount} billeder</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </article>
            ) : null}

                        {/*<article className="home-v2-card home-v2-section-card">*/}
            {/*  <div className="home-v2-section-head">*/}
            {/*    <h2>Hurtige genveje</h2>*/}
            {/*  </div>*/}
            {/*  <div className="home-v2-quick-list">*/}
            {/*    <Link className="home-v2-row-item" href={publicRoutes.about(club.slug)}>*/}
            {/*      <div className="home-v2-row-icon">📜</div>*/}
            {/*      <div>*/}
            {/*        <div className="home-v2-row-title">Vedtægter</div>*/}
            {/*        <div className="home-v2-row-sub">Klubbens formelle vedtægter og rammer for medlemskab</div>*/}
            {/*      </div>*/}
            {/*      <span className="home-v2-status-badge home-v2-info">Åbn</span>*/}
            {/*    </Link>*/}
            {/*    <Link className="home-v2-row-item" href={publicRoutes.about(club.slug)}>*/}
            {/*      <div className="home-v2-row-icon">⚠️</div>*/}
            {/*      <div>*/}
            {/*        <div className="home-v2-row-title">Pladsregler</div>*/}
            {/*        <div className="home-v2-row-sub">Sikkerhed, flyvning, brug af bane og fælles regler på pladsen</div>*/}
            {/*      </div>*/}
            {/*      <span className="home-v2-status-badge home-v2-info">Åbn</span>*/}
            {/*    </Link>*/}
            {/*    <Link className="home-v2-row-item" href={publicRoutes.flightSchoolCalendar(club.slug)}>*/}
            {/*      <div className="home-v2-row-icon">🗓️</div>*/}
            {/*      <div>*/}
            {/*        <div className="home-v2-row-title">Skolekalender</div>*/}
            {/*        <div className="home-v2-row-sub">Se planlagte skoleflyvninger, tider og dagens instruktion</div>*/}
            {/*      </div>*/}
            {/*      <span className="home-v2-status-badge home-v2-info">Åbn</span>*/}
            {/*    </Link>*/}
            {/*  </div>*/}
            {/*</article>*/}
          </div>
        </section>

        <ThemedFooter
          clubName={clubShortName}
          footerData={footerData}
        />
      </div>
    </div>
  );
}
