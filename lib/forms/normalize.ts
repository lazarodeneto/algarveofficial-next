/**
 * lib/forms/normalize.ts
 *
 * Normalization utilities for forms - converts UI values to database-safe values.
 */

export function emptyToNull(
  value: string | null | undefined
): string | null {
  if (value === "") return null;
  if (value === null || value === undefined) return null;
  return value;
}

export function nullToEmpty(
  value: string | null | undefined
): string {
  return value ?? "";
}

export function normalizeSelect(
  value: string | undefined
): string | undefined {
  return value === "" ? undefined : value;
}

export function denormalizeSelect(
  value: string | undefined,
  sentinel: string = "none"
): string {
  return value ?? sentinel;
}

export function emptyArrayToNull<T>(
  value: T[] | null | undefined
): T[] | null {
  if (!value || value.length === 0) return null;
  return value;
}

export function normalizeBooleanSelect(
  value: string | undefined
): boolean | undefined {
  if (value === "" || value === undefined) return undefined;
  return value === "true";
}

export function denormalizeBooleanSelect(
  value: boolean | null | undefined
): string {
  if (value === null || value === undefined) return "";
  return value ? "true" : "false";
}