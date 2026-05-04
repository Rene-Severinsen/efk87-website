import React from 'react';
import Link from 'next/link';
import './PublicShell.css';
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
      className={mobile ? 'efk-topbar-brand efk-topbar-brand--mobile' : 'efk-topbar-brand'}
      aria-label={brandLabel}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={brandLabel}
          className={mobile ? 'efk-topbar-logo efk-topbar-logo--mobile' : 'efk-topbar-logo'}
        />
      ) : null}

      <span className="efk-topbar-brand-text">
        <span className="efk-topbar-brand-name">{clubDisplayName}</span>
        <span className="efk-topbar-brand-subtitle">Klubsite</span>
      </span>
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
              mobile ? 'efk-topbar-nav-link efk-topbar-nav-link--mobile' : 'efk-topbar-nav-link',
              isActive ? 'active' : '',
            ].join(' ').trim()}
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
        const className = [
          mobile ? 'efk-topbar-action efk-topbar-action--mobile' : 'efk-topbar-action',
          item.isPrimary ? 'efk-topbar-primary-action' : '',
        ].join(' ').trim();

        if (item.key === 'logout') {
          return (
            <form
              key={item.key}
              action={logoutAction.bind(null, clubSlug)}
              className={mobile ? 'efk-topbar-action-form efk-topbar-action-form--mobile' : 'efk-topbar-action-form'}
            >
              <button type="submit" className={className}>
                {item.label}
              </button>
            </form>
          );
        }

        return (
          <Link key={item.key} href={item.href} className={className}>
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="efk-topbar-root">
      <div className="efk-topbar-desktop">
        {renderBrand(false)}

        <nav className="efk-topbar-nav" aria-label="Hovedmenu">
          {renderNavLinks(false)}
        </nav>

        <div className="efk-topbar-actions">
          {renderAuthActions(false)}
        </div>
      </div>

      <details className="efk-topbar-mobile-details">
        <summary className="efk-topbar-mobile-summary">
          {renderBrand(true)}

          <span className="efk-topbar-mobile-toggle" aria-hidden="true">
            <span className="efk-topbar-mobile-toggle-open">☰</span>
            <span className="efk-topbar-mobile-toggle-close">✕</span>
          </span>
        </summary>

        <div className="efk-topbar-mobile-menu">
          <nav className="efk-topbar-mobile-nav" aria-label="Mobil hovedmenu">
            {renderNavLinks(true)}
          </nav>

          <div className="efk-topbar-mobile-separator" />

          <div className="efk-topbar-mobile-actions">
            {renderAuthActions(true)}
          </div>
        </div>
      </details>
    </header>
  );
};
