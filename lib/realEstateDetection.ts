const REAL_ESTATE_SIGNAL_KEYS = [
  "property_type",
  "transaction_type",
  "bedrooms",
  "bathrooms",
  "property_size_m2",
  "plot_size_m2",
  "agent_name",
  "agent_email",
  "agent_phone",
  "price",
] as const;

const REAL_ESTATE_CATEGORY_SLUGS = new Set(["real-estate", "prime-real-estate"]);

function hasMeaningfulSignalValue(value: unknown): boolean {
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string") return value.trim().length > 0;
  return Boolean(value);
}

export function hasRealEstateSignals(details: Record<string, unknown> | null | undefined): boolean {
  if (!details) return false;
  return REAL_ESTATE_SIGNAL_KEYS.some((key) => hasMeaningfulSignalValue(details[key]));
}

export function isRealEstateCategorySlug(slug: string | null | undefined): boolean {
  if (!slug) return false;
  return REAL_ESTATE_CATEGORY_SLUGS.has(slug.toLowerCase().trim());
}
