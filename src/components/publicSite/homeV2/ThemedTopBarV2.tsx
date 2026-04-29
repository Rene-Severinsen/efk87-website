'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublicNavigationItem } from "../../../lib/publicSite/publicNavigation";

interface ThemedTopBarV2Props {
  clubSlug: string;
  clubShortName: string;
  clubDisplayName: string;
  navigationItems: PublicNavigationItem[];
  actionItems: PublicNavigationItem[];
}

export const ThemedTopBarV2: React.FC<ThemedTopBarV2Props> = ({
  clubSlug,
  clubShortName,
  clubDisplayName,
  navigationItems,
  actionItems,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="home-v2-topbar">
      <div className="home-v2-brand">
        <div className="home-v2-brand-mark">{clubShortName}</div>
        <div>
          <div>{clubDisplayName} Medlemsportal</div>
          <div className="home-v2-small">{clubDisplayName}</div>
        </div>
      </div>

      <button 
        className="home-v2-nav-toggle" 
        onClick={toggleMenu}
        aria-label={isMenuOpen ? "Luk menu" : "Åbn menu"}
        aria-expanded={isMenuOpen}
      >
        {isMenuOpen ? '✕' : '☰'}
      </button>

      <div className={`home-v2-nav-menu ${isMenuOpen ? 'mobile-open' : ''}`}>
        <nav className="home-v2-nav">
          {navigationItems.map((item) => (
            <Link
              key={item.key}
              className={item.key === 'home' ? 'home-v2-active' : ''}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="home-v2-actions">
          {actionItems.map((item) => {
            if (item.key === 'logout') {
              return (
                <form key={item.key} action="/api/auth/signout" method="POST" style={{ display: 'inline' }}>
                  <button type="submit" className="home-v2-btn home-v2-chip-btn">
                    {item.label}
                  </button>
                </form>
              );
            }

            const isPrimary = item.isPrimary || item.key === 'admin';
            return (
              <Link
                key={item.key}
                className={`home-v2-btn home-v2-chip-btn ${isPrimary ? 'home-v2-primary' : ''}`}
                href={item.href === `/${clubSlug}/login` ? `/api/auth/signin?callbackUrl=/${clubSlug}` : item.href}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
};
