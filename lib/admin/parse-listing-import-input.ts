export interface ListingImportParseResult {
  listings: Record<string, unknown>[] | null;
  error: string | null;
}

export function parseListingImportInput(jsonString: string): ListingImportParseResult {
  if (!jsonString.trim()) {
    return { listings: null, error: null };
  }

  try {
    const parsed = JSON.parse(jsonString) as unknown;

    if (Array.isArray(parsed)) {
      return { listings: parsed as Record<string, unknown>[], error: null };
    }

    if (parsed && typeof parsed === "object") {
      return { listings: [parsed as Record<string, unknown>], error: null };
    }

    return { listings: null, error: "JSON must be an object or an array of objects." };
  } catch {
    return { listings: null, error: "Invalid JSON format" };
  }
}
