'use client';

import React, { useState } from 'react';
import { PublicNavigationItem } from '../../lib/publicSite/publicNavigation';
import { logoutAction } from '../../lib/auth/logout';

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
                                                            currentPath,
                                                          }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActiveItem = (item: PublicNavigationItem) => {
    if (currentPath === item.href) return true;

    if (item.key === 'home') {
      return currentPath === `/${clubSlug}`;
    }

    return false;
  };

  const renderNavLinks = (mobile = false) => (
      <>
        {navigationItems.map((item) => {
          const isActive = isActiveItem(item);

          return (
              <a
                  key={item.key}
                  href={item.href}
                  className={[
                    'transition-colors duration-200',
                    mobile
                        ? 'flex min-h-[44px] w-full items-center rounded-xl px-4 py-3 text-sm'
                        : 'inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full px-3 py-2 text-sm',
                    isActive
                        ? mobile
                            ? 'border border-sky-300/25 bg-sky-300/10 font-semibold text-white'
                            : 'border border-sky-300/25 bg-sky-300/10 text-white'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white',
                  ].join(' ')}
                  onClick={closeMenu}
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
          const baseClassName = [
            'flex min-h-[44px] items-center justify-center rounded-full text-sm font-semibold transition-all duration-200',
            mobile ? 'w-full rounded-xl px-4 py-3' : 'px-4 py-2',
            item.isPrimary
                ? 'border border-emerald-400/30 bg-gradient-to-br from-emerald-400/20 to-sky-400/20 text-emerald-300 hover:from-emerald-400/30 hover:to-sky-400/30'
                : 'border border-white/10 bg-white/5 text-white hover:bg-white/10',
          ].join(' ');

          if (item.key === 'logout') {
            return (
                <form
                    key={item.key}
                    action={async () => {
                      await logoutAction(clubSlug);
                    }}
                    className={mobile ? 'w-full' : ''}
                >
                  <button type="submit" className={baseClassName}>
                    {item.label}
                  </button>
                </form>
            );
          }

          return (
              <a
                  key={item.key}
                  href={item.href}
                  className={baseClassName}
                  onClick={closeMenu}
              >
                {item.label}
              </a>
          );
        })}
      </>
  );

  return (
      <header className="sticky top-4 z-[900] relative isolation-isolate mx-auto w-full max-w-[1400px] rounded-[24px] border border-white/10 bg-slate-950/90 px-4 py-3 shadow-2xl backdrop-blur-xl min-[1100px]:rounded-full pointer-events-auto">
        {/* Mobile/Tablet Header */}
        <div className="flex items-center justify-between gap-3 pointer-events-auto pr-14 min-[1100px]:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-emerald-400/20 to-sky-400/30 text-xs font-bold text-white">
              {clubName}
            </div>

            <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-bold leading-tight text-white">
              {clubDisplayName}
            </span>
              <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Klubsite
            </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
          </div>
        </div>

        {/* Burger button: absolute top-layer hit area */}
        <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsMenuOpen((open) => !open);
            }}
            onTouchEnd={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsMenuOpen((open) => !open);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-[9999] pointer-events-auto touch-manipulation select-none cursor-pointer flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-xl bg-slate-900/90 border border-white/10 text-white transition-colors hover:bg-white/5 active:bg-white/10 min-[1100px]:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="public-mobile-menu"
            aria-label={isMenuOpen ? 'Luk menu' : 'Åbn menu'}
        >
          <span aria-hidden="true">{isMenuOpen ? '✕' : '☰'}</span>
        </button>

        {/* Desktop Header */}
        <div className="hidden items-center justify-between gap-6 min-[1100px]:flex">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-emerald-400/20 to-sky-400/30 text-xs font-bold text-white">
              {clubName}
            </div>

            <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-bold leading-tight text-white">
              {clubDisplayName}
            </span>
              <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Klubsite
            </span>
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
                className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-[950] flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl min-[1100px]:hidden"
            >
              {renderNavLinks(true)}
              <div className="my-2 h-px bg-white/10" />
              <div className="flex flex-col gap-2">{renderAuthActions(true)}</div>
            </nav>
        )}
      </header>
  );
};