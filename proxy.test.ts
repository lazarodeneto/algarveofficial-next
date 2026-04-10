import { describe, expect, it } from "vitest";

import {
  getLocalizedPathFromLegacyVisitLocaleAlias,
  getLocalizedPathFromNestedLocaleAlias,
  getLocalizedPathFromLocaleAlias,
  getUnlocalizedCanonicalPathFromRequestPath,
} from "./proxy";

describe("proxy unlocalized canonical path resolution", () => {
  it("keeps only system canonical routes unlocalized", () => {
    expect(getUnlocalizedCanonicalPathFromRequestPath("/signup")).toBeNull();
    expect(getUnlocalizedCanonicalPathFromRequestPath("/forgot-password")).toBeNull();
    expect(getUnlocalizedCanonicalPathFromRequestPath("/maintenance")).toBe("/maintenance");
  });

  it("normalizes trailing slash for canonical unlocalized routes", () => {
    expect(getUnlocalizedCanonicalPathFromRequestPath("/maintenance/")).toBe("/maintenance");
    expect(getUnlocalizedCanonicalPathFromRequestPath("/fr/forgot-password/")).toBeNull();
  });

  it("does not mark localized-first routes with localized counterparts as unlocalized", () => {
    expect(getUnlocalizedCanonicalPathFromRequestPath("/en/directory")).toBeNull();
    expect(getUnlocalizedCanonicalPathFromRequestPath("/fr/contact")).toBeNull();
    expect(getUnlocalizedCanonicalPathFromRequestPath("/real-estate")).toBeNull();
    expect(getUnlocalizedCanonicalPathFromRequestPath("/real-estate/premium-villa")).toBeNull();
  });
});

describe("proxy locale alias path normalization", () => {
  it("maps shorthand locale aliases to supported locale prefixes", () => {
    expect(getLocalizedPathFromLocaleAlias("/pt/experiences")).toBe("/pt-pt/experiences");
    expect(getLocalizedPathFromLocaleAlias("/pt")).toBe("/pt-pt");
    expect(getLocalizedPathFromLocaleAlias("/en-us/directory")).toBe("/en/directory");
  });

  it("ignores already supported locale prefixes and regular paths", () => {
    expect(getLocalizedPathFromLocaleAlias("/en/experiences")).toBeNull();
    expect(getLocalizedPathFromLocaleAlias("/pt-pt/experiences")).toBeNull();
    expect(getLocalizedPathFromLocaleAlias("/experiences")).toBeNull();
  });
});

describe("proxy nested locale alias normalization", () => {
  it("repairs malformed locale-prefixed paths with locale aliases in segment two", () => {
    expect(getLocalizedPathFromNestedLocaleAlias("/en/pt/experiences")).toBe("/pt-pt/experiences");
    expect(getLocalizedPathFromNestedLocaleAlias("/fr/en-us/directory")).toBe("/en/directory");
    expect(getLocalizedPathFromNestedLocaleAlias("/en/pt")).toBe("/pt-pt");
  });

  it("ignores valid locale nesting and non-localized paths", () => {
    expect(getLocalizedPathFromNestedLocaleAlias("/en/pt-pt/experiences")).toBeNull();
    expect(getLocalizedPathFromNestedLocaleAlias("/pt/experiences")).toBeNull();
    expect(getLocalizedPathFromNestedLocaleAlias("/experiences")).toBeNull();
  });
});

describe("proxy legacy visit locale alias recovery", () => {
  it("repairs stale legacy visit paths carrying locale aliases as city segment", () => {
    expect(getLocalizedPathFromLegacyVisitLocaleAlias("/en/visit/pt/experiences")).toBe(
      "/pt-pt/experiences",
    );
    expect(getLocalizedPathFromLegacyVisitLocaleAlias("/fr/visit/en-us/directory")).toBe(
      "/en/directory",
    );
  });

  it("ignores standard visit URLs and unrelated paths", () => {
    expect(getLocalizedPathFromLegacyVisitLocaleAlias("/en/visit/lagos/experiences")).toBeNull();
    expect(getLocalizedPathFromLegacyVisitLocaleAlias("/visit/pt/experiences")).toBeNull();
  });
});
