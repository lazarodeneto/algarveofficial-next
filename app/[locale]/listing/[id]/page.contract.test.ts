import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  join(process.cwd(), "app", "[locale]", "listing", "[id]", "page.tsx"),
  "utf8",
);
const canonicalSource = readFileSync(
  join(process.cwd(), "app", "listing", "[id]", "page.tsx"),
  "utf8",
);

describe("localized listing page translation contract", () => {
  it("uses listing_translations for localized public rendering", () => {
    expect(source).toContain('.from("listing_translations")');
    expect(source).toContain("const currentTranslation = data.translations[resolvedLocale]");
    expect(source).toContain("initialTranslation={currentTranslation}");
    expect(source).toContain("publicListingTranslationOrNull");
  });

  it("keeps English/source fallback behavior for missing translations", () => {
    expect(source).toContain("getLocalizedRequiredValue");
    expect(source).toContain("return hasTranslation ? \"\" : fallback");
    expect(source).toContain("return hasTranslation ? null : (fallback ?? null)");
  });

  it("keeps the English canonical listing route on the existing redirect path", () => {
    expect(canonicalSource).toContain("redirectToPreferredLocalePath(`/listing/${id}`)");
  });
});
