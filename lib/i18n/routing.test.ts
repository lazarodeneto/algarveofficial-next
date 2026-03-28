import { describe, expect, it } from "vitest";

import {
  buildLocalizedPath,
  hasLocalePrefix,
  isPassthroughHref,
  shouldBypassLocalePrefix,
  switchLocaleInPathname,
} from "./routing";

describe("routing locale helpers", () => {
  it("creates localized hrefs for app routes", () => {
    expect(buildLocalizedPath("en", "/visit")).toBe("/en/visit");
    expect(buildLocalizedPath("pt-pt", "visit")).toBe("/pt-pt/visit");
    expect(buildLocalizedPath("fr", "/")).toBe("/fr");
  });

  it("leaves localized, unlocalized, and file paths untouched", () => {
    expect(buildLocalizedPath("fr", "/en/visit")).toBe("/en/visit");
    expect(buildLocalizedPath("en", "/api/contact")).toBe("/api/contact");
    expect(buildLocalizedPath("en", "/favicon.ico")).toBe("/favicon.ico");
  });

  it("creates localized hrefs while preserving query strings and hashes", () => {
    expect(buildLocalizedPath("en", "/visit?tab=guide#map")).toBe("/en/visit?tab=guide#map");
    expect(buildLocalizedPath("pt-pt", "/#cities")).toBe("/pt-pt#cities");
  });

  it("passes through non-app hrefs unchanged", () => {
    expect(buildLocalizedPath("en", "https://example.com/visit")).toBe("https://example.com/visit");
    expect(buildLocalizedPath("en", "mailto:hello@example.com")).toBe("mailto:hello@example.com");
    expect(buildLocalizedPath("en", "?tab=favorites")).toBe("?tab=favorites");
    expect(buildLocalizedPath("en", "#faq")).toBe("#faq");
  });

  it("swaps locales without dropping the underlying path", () => {
    expect(switchLocaleInPathname("/en/visit", "fr")).toBe("/fr/visit");
    expect(switchLocaleInPathname("/visit", "de")).toBe("/de/visit");
    expect(switchLocaleInPathname("/", "pt-pt")).toBe("/pt-pt");
  });

  it("exposes predicate helpers for centralized routing decisions", () => {
    expect(hasLocalePrefix("/sv/map")).toBe(true);
    expect(hasLocalePrefix("/map")).toBe(false);
    expect(isPassthroughHref("tel:+351123456789")).toBe(true);
    expect(isPassthroughHref("/visit")).toBe(false);
    expect(shouldBypassLocalePrefix("/auth/reset-password")).toBe(true);
    expect(shouldBypassLocalePrefix("/hero-image.webp")).toBe(true);
    expect(shouldBypassLocalePrefix("/visit")).toBe(false);
  });
});
