import { PublicSurfaceVisibility } from "../../generated/prisma";

/**
 * Module-level visibility for public top navigation.
 *
 * This controls whether a module appears in the top menu.
 * It does not override per-record content visibility.
 *
 * Examples:
 * - Articles can be visible in the public menu while individual articles are still filtered.
 * - Forum can be hidden from public menu while remaining available to members.
 */
export const publicNavigationVisibility = {
  forum: "MEMBERS_ONLY",
  articles: "PUBLIC",
} satisfies Record<"forum" | "articles", PublicSurfaceVisibility>;
