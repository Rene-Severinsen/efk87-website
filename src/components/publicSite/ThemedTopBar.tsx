import React from 'react';
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
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">{clubName}</div>
        <div>
          <div>{clubDisplayName} Klubsite</div>
          <div className="small">Det samlede overblik over din klub</div>
        </div>
      </div>

      <nav className="nav">
        {navigationItems.map((item) => {
           const isActive = currentPath === item.href || (item.key === 'home' && currentPath === `/${item.href.split('/')[1]}`);
           return (
            <a 
              key={item.key} 
              href={item.href}
              className={isActive ? 'active' : ''}
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
                "use server";
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
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </header>
  );
};
