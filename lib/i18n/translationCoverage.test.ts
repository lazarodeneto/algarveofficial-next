import { describe, expect, it } from "vitest";

import {
  calculateAllLocaleCoverage,
  calculateLocaleCoverage,
  classifyTranslationKeys,
  flattenTranslationKeys,
  hashTranslationSource,
} from "./translationCoverage";

describe("translation coverage utilities", () => {
  it("flattens nested translation keys and handles arrays as stable scalar values", () => {
    const result = flattenTranslationKeys({
      nav: {
        home: "Home",
        items: ["One", "Two"],
      },
      weather: {
        temperatureLabel: "{{place}} temperature",
      },
    });

    expect(result.values).toEqual({
      "nav.home": "Home",
      "nav.items": "One,Two",
      "weather.temperatureLabel": "{{place}} temperature",
    });
    expect(result.duplicateKeys).toEqual([]);
    expect(result.invalidKeys).toEqual([]);
  });

  it("calculates 3269 / 3276 as 99.8% and prevents 100% while keys are missing", () => {
    const source = Object.fromEntries(
      Array.from({ length: 3276 }, (_, index) => [`key.${index}`, `Value ${index}`]),
    );
    const target = Object.fromEntries(Object.entries(source).slice(0, 3269));

    const coverage = calculateLocaleCoverage(source, target);

    expect(coverage.sourceKeyCount).toBe(3276);
    expect(coverage.translatedKeyCount).toBe(3269);
    expect(coverage.missingKeyCount).toBe(7);
    expect(coverage.coveragePercent).toBeCloseTo(99.7863, 3);
    expect(coverage.coverageLabel).toBe("99.8%");
    expect(coverage.isFullySynced).toBe(false);
  });

  it("classifies missing, stale, obsolete, empty, pending, and complete keys separately", () => {
    const source = {
      "nav.home": "Home",
      "nav.about": "About",
      "nav.contact": "Contact",
      "nav.weather": "Weather",
      "nav.pending": "Pending",
    };
    const target = {
      "nav.home": "Inicio",
      "nav.about": "",
      "nav.weather": "Tempo",
      "nav.pending": "Pending",
      "old.key": "Old",
    };

    const classified = classifyTranslationKeys(source, target, {
      "nav.weather": { sourceHash: hashTranslationSource("Old Weather") },
      "nav.pending": {
        sourceHash: hashTranslationSource("Pending"),
        status: "pending_manual",
      },
    });

    expect(classified.completeKeys).toEqual(["nav.home"]);
    expect(classified.missingKeys).toEqual(["nav.contact"]);
    expect(classified.emptyValueKeys).toEqual(["nav.about"]);
    expect(classified.staleKeys).toEqual(["nav.weather"]);
    expect(classified.pendingManualKeys).toEqual(["nav.pending"]);
    expect(classified.obsoleteKeys).toEqual(["old.key"]);
    expect(classified.statusByKey["nav.pending"]).toBe("pending_manual");
  });

  it("separates selected-locale missing keys from global and unique missing totals", () => {
    const source = {
      a: "A",
      b: "B",
      c: "C",
    };

    const all = calculateAllLocaleCoverage(source, {
      pt: { a: "A", b: "B" },
      fr: { a: "A", c: "C" },
      de: { a: "A", b: "B", c: "C" },
    });

    expect(all.locales.pt.missingKeys).toEqual(["c"]);
    expect(all.locales.fr.missingKeys).toEqual(["b"]);
    expect(all.locales.de.missingKeys).toEqual([]);
    expect(all.totalMissingAcrossLocales).toBe(2);
    expect(all.uniqueMissingSourceKeys).toEqual(["b", "c"]);
    expect(all.fullySyncedLocaleCount).toBe(1);
  });
});
