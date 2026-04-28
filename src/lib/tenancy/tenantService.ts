import prisma from "../db/prisma";
import { normalizeClubSlug } from "./tenantParams";

/**
 * Domain error for tenancy-related failures.
 */
export class TenancyError extends Error {
  constructor(message: string, public code: string = 'TENANT_NOT_FOUND') {
    super(message);
    this.name = 'TenancyError';
  }
}

/**
 * Resolves a club by its slug.
 * 
 * @param slug The club slug to lookup
 * @returns The club with settings, or null if not found
 */
export async function getClubBySlug(slug: string) {
  const normalizedSlug = normalizeClubSlug(slug);
  
  if (!normalizedSlug) {
    return null;
  }

  return prisma.club.findUnique({
    where: {
      slug: normalizedSlug,
    },
    include: {
      settings: true,
    },
  });
}

/**
 * Resolves a club by its slug, or throws an error if not found.
 * 
 * @param slug The club slug to lookup
 * @throws TenancyError if the club is not found or slug is invalid
 * @returns The club with settings
 */
export async function requireClubBySlug(slug: string) {
  const club = await getClubBySlug(slug);
  
  if (!club) {
    throw new TenancyError(`Club not found for slug: ${slug}`);
  }

  return club;
}

/**
 * Placeholder for future domain-based tenant resolution.
 * Currently queries ClubSettings.primaryDomain if present.
 * 
 * @param domain The domain to lookup
 * @returns The club with settings, or null if not found
 */
export async function getClubByDomain(domain: string) {
  if (!domain) return null;

  // For now, simple lookup by primaryDomain in settings
  const settings = await prisma.clubSettings.findFirst({
    where: {
      primaryDomain: domain.toLowerCase().trim(),
    },
    include: {
      club: {
        include: {
          settings: true,
        }
      }
    }
  });

  return settings?.club ?? null;
}
