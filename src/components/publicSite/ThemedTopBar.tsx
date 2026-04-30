import React from 'react';
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
  const isActiveItem = (item: PublicNavigationItem) => {
    if (!currentPath) return false;

    if (currentPath === item.href) return true;

    if (item.key === 'home') {
      return currentPath === `/${clubSlug}`;
    }

    // Active state for forum and its subpages
    if (item.key === 'forum') {
      return currentPath.startsWith(`${item.href}/`);
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
                        ? 'flex min-h-[44px] w-full items-center rounded-xl px-4 py-2.5 text-sm'
                        : 'inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full px-3 py-2 text-sm',
                    isActive
                        ? mobile
                            ? 'border border-sky-300/25 bg-sky-300/10 font-semibold text-white'
                            : 'border border-sky-300/25 bg-sky-300/10 text-white'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white',
                  ].join(' ')}
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
            mobile ? 'w-full rounded-xl px-4 py-2.5' : 'px-4 py-2',
            item.isPrimary
                ? 'border border-emerald-400/30 bg-gradient-to-br from-emerald-400/20 to-sky-400/20 text-emerald-300 hover:from-emerald-400/30 hover:to-sky-400/30'
                : 'border border-white/10 bg-white/5 text-white hover:bg-white/10',
          ].join(' ');

          if (item.key === 'logout') {
            return (
                <form
                    key={item.key}
                    action={logoutAction.bind(null, clubSlug)}
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
              >
                {item.label}
              </a>
          );
        })}
      </>
  );

  return (
      <header className="efk-topbar-root sticky top-4 z-[900] relative isolation-isolate mx-auto w-full max-w-[1400px] pointer-events-auto">
        {/* Desktop Header */}
        <div className="efk-topbar-desktop hidden items-center justify-between gap-6 min-[1100px]:flex rounded-full border border-white/10 bg-slate-950/90 px-6 py-3 shadow-2xl backdrop-blur-xl">
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

        {/* Mobile/Tablet Header */}
        <details className="efk-topbar-mobile-details group min-[1100px]:hidden rounded-[24px] border border-white/10 bg-slate-950/90 shadow-2xl backdrop-blur-xl">
          <summary className="efk-topbar-mobile-summary flex items-center justify-between cursor-pointer list-none select-none touch-manipulation min-h-[56px] px-4 py-3 [&::-webkit-details-marker]:hidden">
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

            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-slate-900/90 text-white transition-colors hover:bg-white/5 active:bg-white/10">
              <span className="text-xl group-open:hidden">☰</span>
              <span className="text-xl hidden group-open:block">✕</span>
            </div>
          </summary>

          <nav className="efk-topbar-mobile-menu mt-3 flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/95 p-3 md:p-4 shadow-2xl md:max-w-2xl md:mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {renderNavLinks(true)}
            </div>
            <div className="my-2 h-px bg-white/10" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {renderAuthActions(true)}
            </div>
          </nav>
        </details>
      </header>
  );
};