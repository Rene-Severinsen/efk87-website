import React from 'react';
import Link from 'next/link';
import { PublicNavigationItem } from '../../lib/publicSite/publicNavigation';
import { logoutAction } from '../../lib/auth/logout';

export interface ThemedTopBarProps {
  clubSlug: string;
  clubName: string;
  clubDisplayName: string;
  logoUrl?: string | null;
  logoAltText?: string | null;
  navigationItems: PublicNavigationItem[];
  actionItems: PublicNavigationItem[];
  currentPath?: string;
}

export const ThemedTopBar: React.FC<ThemedTopBarProps> = ({
  clubSlug,
  clubName,
  clubDisplayName,
  logoUrl,
  logoAltText,
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

    return currentPath.startsWith(`${item.href}/`);
  };

  const brandLabel = logoAltText || clubDisplayName || clubName;

  const renderBrand = (mobile = false) => (
    <Link
      href={`/${clubSlug}`}
      className={[
        'flex min-w-0 items-center no-underline',
        mobile ? 'gap-3' : 'gap-4',
      ].join(' ')}
      aria-label={brandLabel}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={brandLabel}
          className={[
            'block w-auto shrink-0 object-contain',
            mobile ? 'h-12 max-w-[9rem]' : 'h-16 max-w-[14rem]',
          ].join(' ')}
        />
      ) : null}

      <div className="flex min-w-0 flex-col">
        <span
          className={[
            'truncate font-bold leading-tight text-[var(--public-text)]',
            mobile ? 'text-sm' : 'text-base',
          ].join(' ')}
        >
          {clubDisplayName}
        </span>
        <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-[var(--public-text-soft)]">
          Klubsite
        </span>
      </div>
    </Link>
  );

  const renderNavLinks = (mobile = false) => (
    <>
      {navigationItems.map((item) => {
        const isActive = isActiveItem(item);

        return (
          <Link
            key={item.key}
            href={item.href}
            className={[
              'transition-colors duration-200',
              mobile
                ? 'flex min-h-[44px] w-full items-center rounded-xl px-4 py-2.5 text-[1rem] font-semibold'
                : 'inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full px-3 py-2 text-[0.94rem] font-semibold tracking-[-0.01em]',
              isActive
                ? 'active border border-[var(--public-primary)] bg-[var(--public-primary-soft)] text-[var(--public-primary)]'
                : 'border border-transparent text-[var(--public-nav-text)] hover:bg-[var(--public-nav-hover)] hover:text-[var(--public-text)]',
            ].join(' ')}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );

  const renderAuthActions = (mobile = false) => (
    <>
      {actionItems.map((item) => {
        const baseClassName = [
          'flex min-h-[44px] items-center justify-center rounded-full text-[0.94rem] font-bold transition-all duration-200',
          mobile ? 'w-full rounded-xl px-4 py-2.5' : 'px-4 py-2',
          item.isPrimary
            ? 'efk-topbar-primary-action border border-[var(--public-primary)] bg-[var(--public-primary)] text-[var(--public-text-on-primary)] hover:opacity-90'
            : 'border border-[var(--public-card-border)] bg-[var(--public-card)] text-[var(--public-text)] hover:bg-[var(--public-nav-hover)]',
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
          <Link
            key={item.key}
            href={item.href}
            className={baseClassName}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="efk-topbar-root sticky top-4 z-[900] relative isolation-isolate mx-auto w-full max-w-[1400px] pointer-events-auto">
      <div className="efk-topbar-desktop hidden items-center justify-between gap-4 min-[1100px]:flex rounded-full border border-[var(--public-card-border)] bg-[var(--public-card)] px-5 py-2.5 shadow-[var(--public-shadow)] backdrop-blur-xl">
        {renderBrand(false)}

        <nav className="flex items-center gap-0.5">
          {renderNavLinks()}
        </nav>

        <div className="flex items-center gap-2">
          {renderAuthActions()}
        </div>
      </div>

      <details className="efk-topbar-mobile-details group min-[1100px]:hidden rounded-[24px] border border-[var(--public-card-border)] bg-[var(--public-card)] shadow-[var(--public-shadow)] backdrop-blur-xl">
        <summary className="efk-topbar-mobile-summary flex min-h-[64px] cursor-pointer list-none select-none items-center justify-between px-4 py-3 touch-manipulation [&::-webkit-details-marker]:hidden">
          {renderBrand(true)}

          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--public-card-border)] bg-[var(--public-card)] text-[var(--public-text)] transition-colors hover:bg-[var(--public-nav-hover)] active:bg-[var(--public-nav-hover)]">
            <span className="text-xl group-open:hidden">☰</span>
            <span className="hidden text-xl group-open:block">✕</span>
          </div>
        </summary>

        <nav className="efk-topbar-mobile-menu mx-auto mt-3 flex flex-col gap-2 rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-card)] p-3 shadow-[var(--public-shadow)] md:max-w-2xl md:p-4">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {renderNavLinks(true)}
          </div>

          <div className="my-2 h-px bg-[var(--public-card-border)]" />

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {renderAuthActions(true)}
          </div>
        </nav>
      </details>
    </header>
  );
};
