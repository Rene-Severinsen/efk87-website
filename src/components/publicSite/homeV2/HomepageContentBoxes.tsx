"use client";

import React from 'react';
import { HomepageContentWithSignups, isHomepageContentSignupClosed } from '../../../lib/homepageContent/homepageContentUtils';
import { ServerViewerContext } from '../../../lib/auth/viewer';
import { HomepageContentSignupMode } from '../../../generated/prisma';
import { registerForHomepageContentAction, cancelOwnHomepageContentSignupAction } from '../../../lib/homepageContent/homepageContentActions';
import './PublicClubHomePageV2.css';
import { CheckCircle, LogIn, Users, Info, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { publicRoutes } from '../../../lib/publicRoutes';
import sanitizeHtml from 'sanitize-html';
import { formatMemberName } from '../../../lib/members/memberHelpers';

interface HomepageContentBoxesProps {
  clubSlug: string;
  contents: HomepageContentWithSignups[];
  viewer: ServerViewerContext;
}

export default function HomepageContentBoxes({ clubSlug, contents, viewer }: HomepageContentBoxesProps) {
  if (contents.length === 0) return null;

  return (
    <div className="home-v2-content-boxes">
      {contents.map((content) => (
        <ContentBox 
          key={content.id} 
          clubSlug={clubSlug} 
          content={content} 
          viewer={viewer} 
        />
      ))}
    </div>
  );
}

function ContentBox({ clubSlug, content, viewer }: { clubSlug: string, content: HomepageContentWithSignups, viewer: ServerViewerContext }) {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const sanitizedBody = sanitizeHtml(content.bodyHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'p', 'br']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['style', 'class'],
      'a': ['href', 'target', 'rel'],
    }
  });

  const mySignup = viewer.userId ? content.signups.find(s => s.userId === viewer.userId && !s.cancelledAt) : null;
  const isRegistered = !!mySignup;
  const isClosed = isHomepageContentSignupClosed(content);

  const handleRegister = async (formData: FormData) => {
    try {
      await registerForHomepageContentAction(clubSlug, content.id, formData);
      setIsUpdating(false);
    } catch (error) {
      alert("Fejl ved tilmelding: " + (error as Error).message);
    }
  };

  const handleCancel = async () => {
    if (confirm("Er du sikker på, at du vil afmelde dig?")) {
      try {
        await cancelOwnHomepageContentSignupAction(clubSlug, content.id);
      } catch (error) {
        alert("Fejl ved afmelding: " + (error as Error).message);
      }
    }
  };

  const signupLabel = content.signupLabel || (content.signupMode === HomepageContentSignupMode.QUANTITY ? 'Bestil' : 'Tilmeld');

  return (
    <article className="home-v2-card home-v2-content-box">
      <h2>{content.title}</h2>
      <div 
        className="home-v2-content-body"
        dangerouslySetInnerHTML={{ __html: sanitizedBody }}
      />

      {content.signupMode !== HomepageContentSignupMode.NONE && (
        <div className="home-v2-signup-area">
          {content.signupDeadlineAt && !isClosed && (
            <div className="home-v2-signup-deadline" style={{ fontSize: '13px', color: 'var(--public-text-soft)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={14} style={{ color: 'var(--public-info)' }} />
              <span>Tilmelding lukker: {new Date(content.signupDeadlineAt).toLocaleString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}

          {!viewer.isAuthenticated ? (
            <div className="home-v2-signup-status">
              <Info size={20} style={{ color: 'var(--public-info)' }} />
              <span style={{ flex: 1 }}>Log ind for at {signupLabel.toLowerCase()}.</span>
              <Link href={publicRoutes.login(clubSlug)} className="home-v2-pill home-v2-primary">
                <LogIn size={18} />
                Log ind
              </Link>
            </div>
          ) : isClosed ? (
            <div className="home-v2-signup-status">
              <Info size={20} style={{ color: 'var(--public-warning)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>Tilmeldingen er lukket</div>
                {isRegistered && (
                  <div style={{ fontSize: '13px', color: 'var(--public-text-soft)' }}>
                    Du er tilmeldt{content.signupMode === HomepageContentSignupMode.QUANTITY ? ` med ${mySignup.quantity}` : ''}.
                  </div>
                )}
              </div>
            </div>
          ) : isRegistered && !isUpdating ? (
            <div className="home-v2-signup-status">
              <CheckCircle size={24} style={{ color: 'var(--public-success)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>Du er tilmeldt!</div>
                {content.signupMode === HomepageContentSignupMode.QUANTITY && (
                  <div style={{ fontSize: '14px', color: 'var(--public-text-soft)' }}>Antal: {mySignup.quantity}</div>
                )}
              </div>
              <div className="home-v2-signup-actions">
                {content.signupMode === HomepageContentSignupMode.QUANTITY && (
                  <button 
                    onClick={() => setIsUpdating(true)}
                    className="home-v2-pill" 
                    style={{ minHeight: '36px', padding: '0 12px', fontSize: '13px' }}
                  >
                    Ændr
                  </button>
                )}
                <button 
                  onClick={handleCancel}
                  className="home-v2-pill" 
                  style={{ minHeight: '36px', padding: '0 12px', fontSize: '13px', color: 'var(--public-danger)', borderColor: 'var(--public-danger-border)' }}
                >
                  Afmeld
                </button>
              </div>
            </div>
          ) : (
            <form action={handleRegister} className="home-v2-signup-form">
              {content.signupMode === HomepageContentSignupMode.QUANTITY && (
                <div className="home-v2-signup-input-group">
                  <label>Antal</label>
                  <input 
                    name="quantity" 
                    type="number" 
                    min="1" 
                    defaultValue={mySignup?.quantity || 1} 
                    required 
                    className="home-v2-signup-input"
                    style={{ width: '80px' }}
                  />
                </div>
              )}
              <div className="home-v2-signup-input-group" style={{ flex: 1, minWidth: '200px' }}>
                <label>Note (valgfri)</label>
                <input 
                  name="note" 
                  type="text" 
                  placeholder="Evt. besked..."
                  defaultValue={mySignup?.note || ""}
                  className="home-v2-signup-input"
                />
              </div>
              <div className="home-v2-signup-actions">
                {isUpdating && (
                  <button 
                    type="button" 
                    onClick={() => setIsUpdating(false)}
                    className="home-v2-pill"
                  >
                    Fortryd
                  </button>
                )}
                <button type="submit" className="home-v2-pill home-v2-primary">
                  {isUpdating ? 'Opdater' : signupLabel}
                </button>
              </div>
            </form>
          )}

          {(content._count.signups > 0 || viewer.isMember) && (
            <div className="home-v2-participant-summary">
              {content._count.signups > 0 ? (
                <div className="home-v2-participant-count">
                  <Users size={16} />
                  <span>
                    {content._count.signups} {content.signupMode === HomepageContentSignupMode.QUANTITY ? (content._count.signups === 1 ? 'bestilling' : 'bestillinger') : (content._count.signups === 1 ? 'deltager' : 'deltagere')}
                    {content.signupMode === HomepageContentSignupMode.QUANTITY && content.quantityTotal > content._count.signups && ` (${content.quantityTotal} i alt)`}
                  </span>
                </div>
              ) : <div />}
              
              {viewer.isAuthenticated && (viewer.isMember || viewer.isAdmin) && (
                <button 
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="home-v2-link-cyan"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {isExpanded ? 'Skjul tilmeldinger' : 'Se tilmeldinger'}
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              )}
            </div>
          )}

          {isExpanded && viewer.isAuthenticated && (viewer.isMember || viewer.isAdmin) && (
            <div className="home-v2-participant-list">
              {content.signups.length > 0 ? (
                content.signups.map((signup) => (
                  <div key={signup.id} className="home-v2-participant-row">
                    <div className="home-v2-participant-info">
                      <div className="home-v2-participant-name">
                        {formatMemberName(signup.user)}
                      </div>
                      {signup.note && (
                        <div className="home-v2-participant-note">
                          &quot;{signup.note}&quot;
                        </div>
                      )}
                    </div>
                    <div className="home-v2-participant-meta">
                      {content.signupMode === HomepageContentSignupMode.QUANTITY && (
                        <span style={{ fontWeight: 600 }}>{signup.quantity}</span>
                      )}
                      <span style={{ fontSize: '11px', opacity: 0.6 }}>
                        {new Date(signup.createdAt).toLocaleDateString('da-DK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="home-v2-participant-empty">Ingen tilmeldinger endnu.</div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
