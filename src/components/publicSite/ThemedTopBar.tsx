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

  const renderNavLinks = (mobile = false) => (
    <>
      {navigationItems.map((item) => {
        const isActive = currentPath === item.href || (item.key === 'home' && (currentPath === `/${item.href.split('/')[1]}` || currentPath === `/${clubSlug}`));
        return (
          <a
            key={item.key}
            href={item.href}
            className={`
              transition-colors duration-200
              ${mobile 
                ? 'block w-full rounded-xl px-4 py-3 text-sm min-h-[44px] flex items-center hover:bg-white/5 active:bg-sky-300/10 active:border-sky-300/25' 
                : 'inline-flex items-center rounded-full px-3 py-2 text-sm whitespace-nowrap hover:bg-white/5'}
              ${isActive 
                ? (mobile ? 'bg-sky-300/10 text-white font-semibold' : 'bg-sky-300/10 border border-sky-300/25 text-white') 
                : 'text-slate-400'}
            `}
            onClick={() => setIsMenuOpen(false)}
          >
            {item.label}
          </a>
        );
      })}
    </>
  );

  const renderAuthActions = (mobile = false) => (
    <>
      {actionItems.map((item) => {
        if (item.key === 'logout') {
          return (
            <form key={item.key} action={async () => {
              await logoutAction(clubSlug);
            }} className={mobile ? 'w-full' : ''}>
              <button
                type="submit"
                className={`
                  w-full transition-all duration-200 font-semibold text-sm rounded-full flex items-center justify-center min-h-[44px]
                  ${mobile ? 'px-4 py-3 rounded-xl' : 'px-4 py-2'}
                  ${item.isPrimary 
                    ? 'bg-gradient-to-br from-emerald-400/20 to-sky-400/20 border border-emerald-400/30 text-emerald-400 hover:from-emerald-400/30 hover:to-sky-400/30' 
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}
                `}
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
            className={`
              transition-all duration-200 font-semibold text-sm rounded-full flex items-center justify-center min-h-[44px]
              ${mobile ? 'w-full px-4 py-3 rounded-xl' : 'px-4 py-2'}
              ${item.isPrimary 
                ? 'bg-gradient-to-br from-emerald-400/20 to-sky-400/20 border border-emerald-400/30 text-emerald-400 hover:from-emerald-400/30 hover:to-sky-400/30' 
                : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}
            `}
            onClick={() => setIsMenuOpen(false)}
          >
            {item.label}
          </a>
        );
      })}
    </>
  );

  return (
    <header className="relative z-50 topbar bg-slate-950/75 backdrop-blur-xl border border-white/10 shadow-2xl px-4 py-3 rounded-[24px] min-[1100px]:rounded-full sticky top-4 mx-auto w-full max-w-[1400px]">
      {/* Mobile/Tablet Header */}
      <div className="flex items-center justify-between gap-3 min-[1100px]:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-400/20 to-sky-400/30 border border-white/10 font-bold text-xs shrink-0 text-white">
            {clubName}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-sm leading-tight">{clubDisplayName}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Klubsite</span>
          </div>
        </div>

        <button
          type="button"
          className="relative z-[120] pointer-events-auto w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center text-2xl text-white hover:bg-white/5 rounded-xl transition-colors min-[1100px]:hidden"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-controls="public-mobile-menu"
          aria-label={isMenuOpen ? "Luk menu" : "Åbn menu"}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden min-[1100px]:flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-400/20 to-sky-400/30 border border-white/10 font-bold text-xs shrink-0 text-white">
            {clubName}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-sm leading-tight">{clubDisplayName}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Klubsite</span>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          {renderNavLinks()}
        </nav>

        <div className="flex items-center gap-3">
          {renderAuthActions()}
        </div>
      </div>

      {isMenuOpen && (
        <nav 
          id="public-mobile-menu"
          className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-[110] rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-xl p-4 shadow-2xl flex flex-col gap-2 min-[1100px]:hidden"
        >
          {renderNavLinks(true)}
          <div className="h-px bg-white/10 my-2" />
          <div className="flex flex-col gap-2">
            {renderAuthActions(true)}
          </div>
        </nav>
      )}
    </header>
  );
};
