/**
 * Normalizes a club slug for consistent lookup.
 *
 * Rules:
 * - trim whitespace
 * - lowercase
 * - reject empty values
 * - avoid accepting unsafe path-like values
 * - allow lowercase letters, numbers, and hyphens
 *
 * @param input The raw slug input
 * @returns Normalized slug or null if invalid
 */
export function normalizeClubSlug(input: string): string | null {
  if (!input) return null;

  const normalized = input.trim().toLowerCase();

  if (!normalized) return null;

  // Allow lowercase letters, numbers, and hyphens.
  // Reject dots, slashes, underscores, spaces, and other unsafe characters.
  if (!/^[a-z0-9-]+$/.test(normalized)) {
    return null;
  }

  return normalized;
}