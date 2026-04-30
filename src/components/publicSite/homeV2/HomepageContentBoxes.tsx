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
  const sanitizedBody = sanitizeHtml(content.bodyHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['style', 'class'],
    }
  });

  const mySignup = viewer.userId ? content.signups.find(s => s.userId === viewer.userId && !s.cancelledAt) : null;
  const isRegistered = !!mySignup;

  const handleRegister = async (formData: FormData) => {
    try {
      await registerForHomepageContentAction(clubSlug, content.id, formData);
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
              <span>Log ind for at {signupLabel.toLowerCase()}.</span>
              <Link href={`/${clubSlug}/login`} className="home-v2-btn home-v2-btn-primary" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LogIn size={18} />
                Log ind
              </Link>
            </div>
          ) : isRegistered ? (
            <div className="home-v2-signup-status">
              <CheckCircle size={24} style={{ color: '#52c41a' }} />
              <div>
                <div style={{ fontWeight: 600 }}>Du er tilmeldt!</div>
                {content.signupMode === HomepageContentSignupMode.QUANTITY && (
                  <div style={{ fontSize: '14px', color: 'var(--home-v2-muted)' }}>Antal: {mySignup.quantity}</div>
                )}
              </div>
              <button 
                onClick={handleCancel}
                className="home-v2-btn home-v2-btn-ghost" 
                style={{ marginLeft: 'auto', color: '#ff4d4f' }}
              >
                Afmeld
              </button>
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
                    defaultValue="1" 
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
                  className="home-v2-signup-input"
                />
              </div>
              <button type="submit" className="home-v2-btn home-v2-btn-primary">
                {signupLabel}
              </button>
            </form>
          )}

          {content._count.signups > 0 && (
            <div className="home-v2-participant-count">
              <Users size={16} />
              <span>{content._count.signups} {content.signupMode === HomepageContentSignupMode.QUANTITY ? 'bestillinger' : 'deltagere'}</span>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
