export type ForumIconKey =
  | 'message-circle'
  | 'compass'
  | 'battery'
  | 'glider'
  | 'graduation-cap'
  | 'tag'
  | 'wrench'
  | 'settings'
  | 'calendar'
  | 'cloud-wind';

export function guessForumThreadIcon(title: string, categorySlug?: string): ForumIconKey {
  const lowerTitle = title.toLowerCase();

  // Keyword rules
  if (/\b(gps|triangle|f3f|f5j|route|rute|turnpoint)\b/.test(lowerTitle)) return 'compass';
  if (/\b(batteri|lader|oplader|lipo|liion|12v|strøm)\b/.test(lowerTitle)) return 'battery';
  if (/\b(svæve|skrænt|slope|termik)\b/.test(lowerTitle)) return 'glider';
  if (/\b(skole|instruktør|elev|certifikat)\b/.test(lowerTitle)) return 'graduation-cap';
  if (/\b(køb|salg|til salg|søges|byttes)\b/.test(lowerTitle)) return 'tag';
  if (/\b(byg|byggeri|projekt|værksted)\b/.test(lowerTitle)) return 'wrench';
  if (/\b(motor|esc|servo|modtager)\b/.test(lowerTitle)) return 'settings';
  if (/\b(stævne|event|generalforsamling|møde)\b/.test(lowerTitle)) return 'calendar';
  if (/\b(vejret|vind|regn)\b/.test(lowerTitle)) return 'cloud-wind';

  // Category default icons
  if (categorySlug) {
    switch (categorySlug) {
      case 'generelt':
        return 'message-circle';
      case 'gps-triangle':
        return 'compass';
      case 'skoleflyvning':
        return 'graduation-cap';
      case 'køb-salg':
        return 'tag';
      case 'teknik':
        return 'wrench';
    }
  }

  return 'message-circle';
}

export type ForumBadgeColor = 'green' | 'blue' | 'cyan' | 'amber';

export interface ForumBadge {
  text: string;
  color: ForumBadgeColor;
}

export function getForumReplyBadge(replyCount: number, createdAt: Date): ForumBadge {
  const now = new Date();
  const diffInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

  if (diffInHours <= 24 && replyCount <= 3) {
    return { text: 'NY', color: 'green' };
  }

  if (replyCount >= 30) {
    return { text: `${replyCount} SVAR`, color: 'amber' };
  }

  if (replyCount >= 15) {
    return { text: `${replyCount} SVAR`, color: 'cyan' };
  }

  return { text: `${replyCount} SVAR`, color: 'blue' };
}
