import React from 'react';
import './PublicShell.css';
import { ClubTheme, PublicClubFooter, PublicSponsor } from "../../generated/prisma";
import { PublicNavigationItem } from "../../lib/publicSite/publicNavigation";
import { normalizePublicThemeMode } from "../../lib/publicSite/publicThemeService";
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
  subtitle?: React.ReactNode;
  eyebrow?: string;
  currentPath?: string;
  children: React.ReactNode;
  maxWidth?: string;
  publicThemeMode?: string;
}

/**
 * ThemedClubPageShell - Shared layout for all non-home club pages.
 */
export default function ThemedClubPageShell({ 
  clubSlug,
  clubName, 
  clubDisplayName, 
  theme, 
  publicThemeMode,
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
  const normalizedTheme = normalizePublicThemeMode(publicThemeMode);

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
    <div className="public-home" style={themeStyles} data-theme={normalizedTheme}>
      <div className="shell">
        <ThemedTopBar 
          clubSlug={clubSlug}
          clubName={clubName}
          clubDisplayName={clubDisplayName}
          navigationItems={navigationItems}
          actionItems={actionItems}
          currentPath={currentPath}
        />

        <main className="px-4 py-6 sm:px-6 sm:py-12 min-h-[60vh]">
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
