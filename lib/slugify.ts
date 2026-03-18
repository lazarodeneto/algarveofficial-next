/**
 * Converts a string to a URL-friendly slug.
 * - Normalizes unicode (NFD), removes diacritics
 * - Lowercases, replaces spaces/punctuation with hyphens
 * - Collapses multiple hyphens, trims, max ~80 chars
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric
    .replace(/[\s_]+/g, "-") // spaces/underscores → hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-|-$/g, "") // trim leading/trailing hyphens
    .slice(0, 80);
}

/**
 * UUID v4 regex for detecting UUID-based URL params.
 */
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Check if a string is a UUID.
 */
export function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}
