export type SlugEntityType =
  | "listing"
  | "taxonomy"
  | "content"
  | "footer-section"
  | "default";

export const SLUG_MAX_LENGTH_BY_ENTITY: Record<SlugEntityType, number> = {
  listing: 120,
  taxonomy: 80,
  content: 120,
  "footer-section": 80,
  default: 100,
};

export type SlugOptions = {
  entityType?: SlugEntityType;
  maxLength?: number;
};

const STRICT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LOCALE_PREFIX_PATTERN = /^(en|pt-pt|fr|de|es|it|nl|sv|no|da)(?:\/|$)/i;
const APOSTROPHES = /['’‘`´]/g;

function resolveMaxLength(options?: SlugOptions): number {
  return options?.maxLength ?? SLUG_MAX_LENGTH_BY_ENTITY[options?.entityType ?? "default"];
}

function trimToMaxLength(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength).replace(/-+$/g, "");
}

/**
 * Converts arbitrary entity names into the canonical AlgarveOfficial slug form.
 *
 * Standard:
 * - lowercase ASCII
 * - accents normalized away
 * - apostrophes removed
 * - every non-alphanumeric group becomes a single hyphen
 * - duplicate/edge hyphens removed
 * - no locale prefix, path, query string, or full URL
 */
export function slugifyEntityName(input: string | null | undefined, options?: SlugOptions): string {
  const normalized = (input ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(APOSTROPHES, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return trimToMaxLength(normalized, resolveMaxLength(options));
}

/**
 * Normalizes a slug input using the same canonical shape as generated slugs.
 */
export function normalizeSlug(input: string | null | undefined, options?: SlugOptions): string {
  return slugifyEntityName(input, options);
}

export function getDisallowedSlugInputError(slug: string | null | undefined): string | null {
  const trimmed = (slug ?? "").trim();

  if (/^https?:\/\//i.test(trimmed) || /^www\./i.test(trimmed)) {
    return "Slug must not be a full URL.";
  }
  if (LOCALE_PREFIX_PATTERN.test(trimmed)) {
    return "Slug must not include a locale prefix.";
  }
  if (/[/?#]/.test(trimmed)) {
    return "Slug must not contain paths, slashes, query strings, or fragments.";
  }

  return null;
}

export function getSlugValidationError(slug: string | null | undefined, options?: SlugOptions): string | null {
  const trimmed = (slug ?? "").trim();
  const maxLength = resolveMaxLength(options);

  if (!trimmed) return "Slug is required.";

  const disallowedInputError = getDisallowedSlugInputError(trimmed);
  if (disallowedInputError) return disallowedInputError;

  if (trimmed.length > maxLength) {
    return `Slug must be ${maxLength} characters or less.`;
  }
  if (!STRICT_SLUG_PATTERN.test(trimmed)) {
    return "Slug must use lowercase ASCII letters, numbers, and single hyphens only.";
  }
  if (normalizeSlug(trimmed, options) !== trimmed) {
    return "Slug is not in canonical form.";
  }

  return null;
}

export function assertValidSlug(slug: string | null | undefined, options?: SlugOptions): boolean {
  return getSlugValidationError(slug, options) === null;
}

/**
 * Backwards-compatible alias. New code should prefer slugifyEntityName for
 * generated names and normalizeSlug/assertValidSlug for user-provided slugs.
 */
export function slugify(input: string | null | undefined, options?: SlugOptions): string {
  return slugifyEntityName(input, options);
}

/**
 * UUID v4 regex for detecting UUID-based URL params.
 */
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Check if a string is a UUID.
 */
export function isUuid(value: string | null | undefined): boolean {
  return UUID_REGEX.test(value ?? "");
}
