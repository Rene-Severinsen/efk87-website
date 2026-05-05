export type AccessAudience = "public" | "member" | "clubAdmin" | "platformAdmin";

export type AccessModuleKey =
  | "publicHome"
  | "memberHome"
  | "about"
  | "contact"
  | "location"
  | "membership"
  | "flightSchool"
  | "rules"
  | "articles"
  | "gallery"
  | "calendar"
  | "sponsors"
  | "forum"
  | "iAmFlying"
  | "schoolBooking"
  | "memberDirectory"
  | "latestOnline"
  | "internalMessages"
  | "adminDashboard"
  | "siteSettings"
  | "footerAdmin"
  | "memberAdmin"
  | "mediaLibrary"
  | "emailTemplates"
  | "systemStatus"
  | "payments"
  | "legacyImport"
  | "platformDashboard"
  | "tenantAdmin"
  | "platformModules"
  | "platformFeatureFlags"
  | "platformThemeDefaults"
  | "platformOperations";

export type AccessConfigurability =
  | "fixed"
  | "contentVisibility"
  | "roleBased"
  | "platformOnly"
  | "future";

export interface AccessAudienceDefinition {
  key: AccessAudience;
  label: string;
  shortLabel: string;
  description: string;
}

export interface AccessModuleDefinition {
  key: AccessModuleKey;
  label: string;
  area: "Public" | "Member" | "Club admin" | "Platform admin";
  description: string;
  audiences: readonly AccessAudience[];
  configurability: AccessConfigurability;
  note: string;
}
