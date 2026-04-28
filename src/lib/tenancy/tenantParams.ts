/**
 * Normalizes a club slug for consistent lookup.
 * 
 * Rules:
 * - trim whitespace
 * - lowercase
 * - reject empty values
 * - avoid accepting unsafe path-like values (e.g., containing dots or slashes)
 * 
 * @param input The raw slug input
 * @returns Normalized slug or null if invalid
 */
export function normalizeClubSlug(input: string): string | null {
  if (!input) return null;

  const normalized = input.trim().toLowerCase();

  // Reject empty string after trim
  if (!normalized) return null;

  // Reject path-like values or unsafe characters
  // Slugs should only contain alphanumeric characters and hyphens
  if (!/^[a-z0-7-]+$/.test(normalized)) {
    return null;
  }

  return normalized;
}
