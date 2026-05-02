import { normalizeImportCategory } from "@/lib/admin/listing-json-import";

export type ImporterType = "standard" | "golf" | "property" | "concierge-services";

function hasObject(value: unknown) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0);
}

export function detectImporterType(raw: Record<string, unknown>): {
  type: ImporterType;
  category: string;
  errors: Array<{ path: string; message: string }>;
} {
  const category = normalizeImportCategory(raw.category ?? raw.Category);
  const hasGolf = hasObject(raw.golf);
  const hasProperty = hasObject(raw.property);
  const hasConcierge =
    category === "concierge-services" &&
    (hasObject(raw.listing) || hasObject(raw.details) || raw.features !== undefined || hasObject(raw.relations));
  const errors: Array<{ path: string; message: string }> = [];

  if (category === "golf" && hasProperty && !hasGolf) {
    errors.push({ path: "category", message: "category golf conflicts with property data." });
  }

  if (category === "golf" && !hasGolf) {
    errors.push({ path: "golf", message: "golf object is required for golf imports." });
  }

  if (category === "concierge-services" && hasGolf) {
    errors.push({ path: "category", message: "category concierge-services conflicts with golf data." });
  }

  if (category === "concierge-services" && hasProperty) {
    errors.push({ path: "category", message: "category concierge-services conflicts with property data." });
  }

  if (category === "golf") return { type: "golf", category, errors };
  if (category === "concierge-services" && hasConcierge) return { type: "concierge-services", category, errors };
  if (category === "real-estate" || hasProperty) return { type: "property", category: category || "real-estate", errors };

  return { type: "standard", category, errors };
}
