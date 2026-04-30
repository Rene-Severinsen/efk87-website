/**
 * Normalizes a string to be used as a URL slug.
 * Converts to lowercase, replaces Danish characters, and removes non-alphanumeric characters.
 */
export function normalizeSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
