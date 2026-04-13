/**
 * lib/forms/parse.ts
 *
 * Safe parsing utilities for form inputs.
 */

export function safeParseFloat(
  value: string | null | undefined
): number | null {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function safeParseInt(
  value: string | null | undefined,
  radix: number = 10
): number | null {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  const parsed = Number.parseInt(value, radix);
  return Number.isNaN(parsed) ? null : parsed;
}

export function parseBoolean(
  value: string | null | undefined
): boolean | null {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  return value === "true";
}

export function normalizeInputValue(
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

export function formatNumberInput(
  value: number | null | undefined
): string {
  if (value === null || value === undefined) return "";
  return String(value);
}