/**
 * lib/forms/normalize.ts
 *
 * UI ↔ API normalization layer.
 *
 * RULE: these functions run at submit time, never inside render.
 * They translate the controlled-input contract (strings/booleans)
 * into database-safe values.
 */

// ─── String ───────────────────────────────────────────────────────────────────

/** "" | null | undefined  →  null */
export function emptyToNull(value: string | null | undefined): string | null {
  if (value === "" || value === null || value === undefined) return null;
  return value;
}

/** null | undefined  →  "" */
export function nullToEmpty(value: string | null | undefined): string {
  return value ?? "";
}

// ─── Select ───────────────────────────────────────────────────────────────────

/**
 * Sentinel-safe select normalizer.
 * Converts "" or the sentinel string (default "none") to undefined.
 *
 * @example
 *   normalizeSelect("")         // → undefined
 *   normalizeSelect("none")     // → undefined
 *   normalizeSelect("abc-123")  // → "abc-123"
 */
export function normalizeSelect(
  value: string | undefined,
  sentinel = "none",
): string | undefined {
  if (value === "" || value === sentinel || value === undefined) return undefined;
  return value;
}

/**
 * Turns undefined/null back into a sentinel so <Select> always has
 * a controlled value.
 *
 * @example
 *   denormalizeSelect(undefined)      // → "none"
 *   denormalizeSelect("abc-123")      // → "abc-123"
 */
export function denormalizeSelect(
  value: string | undefined | null,
  sentinel = "none",
): string {
  return value ?? sentinel;
}

// ─── Array ────────────────────────────────────────────────────────────────────

/** [] | null | undefined  →  null */
export function emptyArrayToNull<T>(value: T[] | null | undefined): T[] | null {
  if (!value || value.length === 0) return null;
  return value;
}

// ─── Boolean Select ───────────────────────────────────────────────────────────

/**
 * Converts the string values "true"/"false"/"" used by a boolean
 * <Select> into an actual boolean (or undefined when unset).
 */
export function normalizeBooleanSelect(
  value: string | undefined,
): boolean | undefined {
  if (value === "" || value === undefined) return undefined;
  return value === "true";
}

/**
 * Converts a boolean (or null/undefined) back to a string value
 * for a boolean <Select>.
 */
export function denormalizeBooleanSelect(
  value: boolean | null | undefined,
): string {
  if (value === null || value === undefined) return "";
  return value ? "true" : "false";
}
