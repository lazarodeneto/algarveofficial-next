import { describe, expect, it } from "vitest";

import {
  isPublicListingTranslationStatus,
  publicListingTranslationOrNull,
} from "./publicListingTranslations";

describe("public listing translation visibility", () => {
  it("allows reviewed manual translations to render publicly", () => {
    expect(isPublicListingTranslationStatus("reviewed")).toBe(true);
    expect(
      publicListingTranslationOrNull({
        title: "Titre manuel",
        translation_status: "reviewed",
        translation_source: "manual",
      }),
    ).toEqual({
      title: "Titre manuel",
      translation_status: "reviewed",
      translation_source: "manual",
    });
  });

  it("allows automatic translations to render publicly", () => {
    expect(isPublicListingTranslationStatus("auto")).toBe(true);
    expect(
      publicListingTranslationOrNull({
        title: "Titre automatique",
        translation_status: "auto",
        translation_source: "automatic",
      }),
    ).toEqual({
      title: "Titre automatique",
      translation_status: "auto",
      translation_source: "automatic",
    });
  });

  it("hides edited manual drafts so localized pages fall back to source content", () => {
    expect(isPublicListingTranslationStatus("edited")).toBe(false);
    expect(
      publicListingTranslationOrNull({
        title: "Brouillon",
        translation_status: "edited",
        translation_source: "manual",
      }),
    ).toBeNull();
  });

  it("hides missing translations so source fallback remains active", () => {
    expect(publicListingTranslationOrNull(null)).toBeNull();
    expect(publicListingTranslationOrNull({ title: "Queued", translation_status: "queued" })).toBeNull();
  });
});
