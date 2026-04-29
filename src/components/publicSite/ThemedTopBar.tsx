'use client';

import React, { useState } from 'react';
import { PublicNavigationItem } from "../../lib/publicSite/publicNavigation";
import { logoutAction } from "../../lib/auth/logout";

export interface ThemedTopBarProps {
  clubSlug: string;
  clubName: string;
  clubDisplayName: string;
  navigationItems: PublicNavigationItem[];
  actionItems: PublicNavigationItem[];
  currentPath?: string;
}

export const ThemedTopBar: React.FC<ThemedTopBarProps> = ({
  clubSlug,
  clubName,
  clubDisplayName,
  navigationItems,
  actionItems,
  currentPath
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">{clubName}</div>
        <div>
          <div>{clubDisplayName}</div>
          <div className="small">Klubsite</div>
        </div>
      </div>

      <button 
        className="nav-toggle" 
        onClick={toggleMenu}
        aria-label="Toggle navigation"
      >
        {isMenuOpen ? '✕' : '☰'}
      </button>

      <div className={`nav-menu ${isMenuOpen ? 'mobile-open' : ''}`}>
        <nav className="nav">
          {navigationItems.map((item) => {
             const isActive = currentPath === item.href || (item.key === 'home' && (currentPath === `/${item.href.split('/')[1]}` || currentPath === `/${clubSlug}`));
             return (
              <a 
                key={item.key} 
                href={item.href}
                className={isActive ? 'active' : ''}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="actions">
          {actionItems.map((item) => {
            if (item.key === 'logout') {
              return (
                <form key={item.key} action={async () => {
                  await logoutAction(clubSlug);
                }}>
                  <button 
                    type="submit"
                    className={`btn chip-btn ${item.isPrimary ? 'primary' : ''}`}
                  >
                    {item.label}
                  </button>
                </form>
              );
            }

            return (
              <a 
                key={item.key} 
                href={item.href}
                className={`btn chip-btn ${item.isPrimary ? 'primary' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      </div>
    </header>
  );
};
