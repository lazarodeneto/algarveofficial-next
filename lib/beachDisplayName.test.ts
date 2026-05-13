import { describe, expect, it } from "vitest";

import { getEnglishBeachDisplayName } from "@/lib/beachDisplayName";

describe("getEnglishBeachDisplayName", () => {
  it("adds English alias for known beaches in English locale", () => {
    expect(getEnglishBeachDisplayName("Praia da Rocha", "en", "beaches")).toBe(
      "Rock Beach - Praia da Rocha",
    );
    expect(getEnglishBeachDisplayName("Praia da Falésia", "en", "beaches")).toBe(
      "Falesia Beach - Praia da Falésia",
    );
  });

  it("does not alter unknown beach names", () => {
    expect(getEnglishBeachDisplayName("Praia do Vau", "en", "beaches")).toBe(
      "Vau Beach - Praia do Vau",
    );
  });

  it("builds generic English alias for Portuguese praia names", () => {
    expect(getEnglishBeachDisplayName("Praia do Vale do Lobo", "en", "beaches")).toBe(
      "Vale do Lobo Beach - Praia do Vale do Lobo",
    );
    expect(getEnglishBeachDisplayName("Praia de Benagil", "en", "beaches")).toBe(
      "Benagil Beach - Praia de Benagil",
    );
  });

  it("does not force format on names that are not Portuguese praia pattern", () => {
    expect(getEnglishBeachDisplayName("Da Oura Beach", "en", "beaches")).toBe("Da Oura Beach");
  });

  it("does not alter non-English locales", () => {
    expect(getEnglishBeachDisplayName("Praia da Rocha", "pt-pt", "beaches")).toBe("Praia da Rocha");
  });

  it("does not alter non-beach categories", () => {
    expect(getEnglishBeachDisplayName("Praia da Rocha", "en", "restaurants")).toBe("Praia da Rocha");
  });
});
