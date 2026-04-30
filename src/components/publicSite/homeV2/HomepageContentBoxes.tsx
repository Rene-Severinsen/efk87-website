"use client";

import React from 'react';
import { HomepageContentWithSignups } from '../../../lib/homepageContent/homepageContentService';
import { ServerViewerContext } from '../../../lib/auth/viewer';
import { HomepageContentSignupMode } from '../../../generated/prisma';
import { registerForHomepageContentAction, cancelOwnHomepageContentSignupAction } from '../../../lib/homepageContent/homepageContentActions';
import './PublicClubHomePageV2.css';
import { CheckCircle, LogIn, Users, Info } from 'lucide-react';
import Link from 'next/link';
import sanitizeHtml from 'sanitize-html';

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
          {!viewer.isAuthenticated ? (
            <div className="home-v2-signup-status">
              <Info size={20} className="text-blue-400" />
              <span style={{ flex: 1 }}>Log ind for at {signupLabel.toLowerCase()}.</span>
              <Link href={`/${clubSlug}/login`} className="home-v2-pill home-v2-primary">
                <LogIn size={18} />
                Log ind
              </Link>
            </div>
          ) : content.isSignupClosed ? (
            <div className="home-v2-signup-status">
              <Info size={20} className="text-amber-400" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>Tilmeldingen er lukket</div>
                {isRegistered && (
                  <div style={{ fontSize: '13px', color: 'var(--home-v2-muted)' }}>
                    Du er tilmeldt{content.signupMode === HomepageContentSignupMode.QUANTITY ? ` med ${mySignup.quantity}` : ''}.
                  </div>
                )}
              </div>
            </div>
          ) : isRegistered && !isUpdating ? (
            <div className="home-v2-signup-status">
              <CheckCircle size={24} style={{ color: '#52c41a' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>Du er tilmeldt!</div>
                {content.signupMode === HomepageContentSignupMode.QUANTITY && (
                  <div style={{ fontSize: '14px', color: 'var(--home-v2-muted)' }}>Antal: {mySignup.quantity}</div>
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
                  style={{ minHeight: '36px', padding: '0 12px', fontSize: '13px', color: '#ff4d4f', borderColor: 'rgba(255, 77, 79, 0.2)' }}
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
                <Link href={`/${clubSlug}/forside-indhold/${content.id}/tilmeldinger`} className="home-v2-link-cyan">
                  Se tilmeldinger
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
