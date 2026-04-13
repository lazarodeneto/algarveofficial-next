/**
 * lib/forms/parse.ts
 *
 * Safe input-value parsers.
 *
 * RULE: call these in onChange handlers (or submit normalizers) where you
 * need to convert the raw string from an <Input type="number"> into a
 * proper JS number — or null when the field is empty/invalid.
 *
 * NEVER use:  Number.parseFloat(e.target.value) || 0
 * ALWAYS use: safeParseFloat(e.target.value)  // returns null on empty/NaN
 */

// ─── Numeric ──────────────────────────────────────────────────────────────────

/**
 * "" | null | undefined | NaN  →  null
 * Otherwise → float
 */
export function safeParseFloat(
  value: string | number | null | undefined,
): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number.parseFloat(String(value));
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * "" | null | undefined | NaN  →  null
 * Otherwise → integer
 */
export function safeParseInt(
  value: string | number | null | undefined,
  radix = 10,
): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number.parseInt(String(value), radix);
  return Number.isNaN(parsed) ? null : parsed;
}

// ─── Boolean ─────────────────────────────────────────────────────────────────

/** "true" → true, "false" → false, anything else → null */
export function parseBoolean(
  value: string | null | undefined,
): boolean | null {
  if (value === "" || value === null || value === undefined) return null;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

// ─── Input display helpers ────────────────────────────────────────────────────

/**
 * Converts any form value to a string for use as a controlled input's
 * `value` prop. null/undefined become "".
 *
 * @example  <Input value={normalizeInputValue(field.value)} />
 */
export function normalizeInputValue(
  value: string | number | null | undefined,
): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

/**
 * Formats a number (or null) as a string for <Input type="number">.
 * Null / undefined produce "" so the input is never uncontrolled.
 */
export function formatNumberInput(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value);
}
