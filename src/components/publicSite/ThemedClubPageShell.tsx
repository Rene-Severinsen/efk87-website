import React from 'react';
import './PublicClubHomePage.css';
import { ClubTheme, PublicClubFooter, PublicSponsor } from "../../generated/prisma";
import { PublicNavigationItem } from "../../lib/publicSite/publicNavigation";
import { ThemedTopBar } from "./ThemedTopBar";
import { ThemedFooter } from "./ThemedFooter";
import { ThemedPageHeader } from "./ThemedBuildingBlocks";

interface PublicFooterData {
  footer: PublicClubFooter | null;
  sponsors: PublicSponsor[];
}

interface ThemedClubPageShellProps {
  clubSlug: string;
  clubName: string;
  clubDisplayName: string;
  theme?: ClubTheme;
  footerData?: PublicFooterData;
  navigationItems?: PublicNavigationItem[];
  actionItems?: PublicNavigationItem[];
  title: string;
  subtitle?: string;
  eyebrow?: string;
  currentPath?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

/**
 * ThemedClubPageShell - Shared layout for all non-home club pages.
 * 
 * Uses the same visual language as the approved homepage.
 */
export default function ThemedClubPageShell({ 
  clubSlug,
  clubName, 
  clubDisplayName, 
  theme, 
  footerData,
  navigationItems = [],
  actionItems = [],
  title,
  subtitle,
  eyebrow,
  currentPath,
  children,
  maxWidth = '1000px'
}: ThemedClubPageShellProps) {
  // Theme CSS variables
  const themeStyles = theme ? {
    '--club-bg': theme.backgroundColor,
    '--club-panel': theme.panelColor,
    '--club-panel-soft': theme.panelSoftColor,
    '--club-line': theme.lineColor,
    '--club-text': theme.textColor,
    '--club-muted': theme.mutedTextColor,
    '--club-accent': theme.accentColor,
    '--club-accent-2': theme.accentColor2,
    '--club-shadow': theme.shadowValue,
    '--club-radius': theme.radiusValue,
  } as React.CSSProperties : {};

  return (
    <div className="public-home" style={themeStyles}>
      <div className="shell">
        <ThemedTopBar 
          clubSlug={clubSlug}
          clubName={clubName}
          clubDisplayName={clubDisplayName}
          navigationItems={navigationItems}
          actionItems={actionItems}
          currentPath={currentPath}
        />

        <main style={{ padding: '2rem 1rem', minHeight: '60vh' }}>
          <div style={{ maxWidth: maxWidth, margin: '0 auto' }}>
            {!currentPath?.endsWith('/profil') && (
              <ThemedPageHeader 
                title={title}
                subtitle={subtitle}
                eyebrow={eyebrow}
              />
            )}
            {children}
          </div>
        </main>

        <ThemedFooter 
          clubName={clubName}
          footerData={footerData}
        />
      </div>
    </div>
  );
}
