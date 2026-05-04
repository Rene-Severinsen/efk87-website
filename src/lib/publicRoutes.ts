/**
 * Shared route helpers for club-scoped public and member routes.
 *
 * These helpers centralize route string construction to ensure consistency
 * and make it easier to update routes in the future.
 *
 * NOTE: These routes MUST return absolute app paths starting with /.
 */

export const publicRoutes = {
  home: (clubSlug: string) => `/${clubSlug}`,
  about: (clubSlug: string) => `/${clubSlug}/about`,
  board: (clubSlug: string) => `/${clubSlug}/om/bestyrelsen`,
  contact: (clubSlug: string) => `/${clubSlug}/om/kontakt`,
  whereWeLive: (clubSlug: string) => `/${clubSlug}/om/her-bor-vi`,
  forum: (clubSlug: string) => `/${clubSlug}/forum`,
  gallery: (clubSlug: string) => `/${clubSlug}/galleri`,
  articles: (clubSlug: string) => `/${clubSlug}/artikler`,
  flightSchool: (clubSlug: string) => `/${clubSlug}/flyveskole`,
  flightSchoolCalendar: (clubSlug: string) => `/${clubSlug}/flyveskole/skolekalender`,
  jegFlyver: (clubSlug: string) => `/${clubSlug}/jeg-flyver`,
  jegFlyverList: (clubSlug: string) => `/${clubSlug}/jeg-flyver/liste`,
  profile: (clubSlug: string) => `/${clubSlug}/profil`,
  members: (clubSlug: string) => `/${clubSlug}/members`,
  events: (clubSlug: string) => `/${clubSlug}/events`,
  becomeMember: (clubSlug: string) => `/${clubSlug}/bliv-medlem`,
  login: (clubSlug: string) => `/${clubSlug}/login`,
  logout: (clubSlug: string) => `/${clubSlug}/logout`,

  // Specific dynamic routes
  calendarEntry: (clubSlug: string, entryId: string | number) => `/${clubSlug}/kalender/${entryId}`,
  forumCategory: (clubSlug: string, categorySlug: string) => `/${clubSlug}/forum/${categorySlug}`,
  forumThread: (clubSlug: string, categorySlug: string, threadSlug: string) => `/${clubSlug}/forum/${categorySlug}/${threadSlug}`,
  article: (clubSlug: string, articleSlug: string) => `/${clubSlug}/artikler/${articleSlug}`,
  galleryAlbum: (clubSlug: string, albumSlug: string) => `/${clubSlug}/galleri/${albumSlug}`,
  flightSchoolDocument: (clubSlug: string, documentSlug: string) => `/${clubSlug}/flyveskole/${documentSlug}`,
  profileMemberCard: (clubSlug: string) => `/${clubSlug}/profil/medlemskort`,
  forgotPassword: (clubSlug: string) => `/${clubSlug}/login/glemt-adgangskode`,
  homepageContentSignups: (clubSlug: string, contentId: string) => `/${clubSlug}/forside-indhold/${contentId}/tilmeldinger`,
};