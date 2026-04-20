const DEFAULT_GA_MEASUREMENT_ID = "G-T989074CQL";
const GA_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]+$/i;

export function normalizeGaMeasurementId(
  measurementId: string | null | undefined,
): string | null {
  const normalized = measurementId?.trim().toUpperCase() ?? "";
  if (!normalized) return null;
  return GA_MEASUREMENT_ID_PATTERN.test(normalized) ? normalized : null;
}

export function getConfiguredGaMeasurementId(): string {
  return (
    normalizeGaMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) ??
    DEFAULT_GA_MEASUREMENT_ID
  );
}

export function resolveGaMeasurementId(
  measurementId: string | null | undefined,
): string {
  return normalizeGaMeasurementId(measurementId) ?? getConfiguredGaMeasurementId();
}
