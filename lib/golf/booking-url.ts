export function isEmptyOrValidUrl(value: string): boolean {
  if (value.trim().length === 0) return true;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
