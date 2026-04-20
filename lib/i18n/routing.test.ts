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
    expect(buildLocalizedPath("en", "/visit")).toBe("/stay");
    expect(buildLocalizedPath("pt-pt", "visit")).toBe("/pt-pt/stay");
    expect(buildLocalizedPath("fr", "/")).toBe("/fr");
  });

  it("leaves localized, unlocalized, and file paths untouched", () => {
    expect(buildLocalizedPath("fr", "/en/visit")).toBe("/stay");
    expect(buildLocalizedPath("en", "/api/contact")).toBe("/api/contact");
    expect(buildLocalizedPath("en", "/favicon.ico")).toBe("/favicon.ico");
    expect(buildLocalizedPath("en", "/maintenance")).toBe("/maintenance");
  });

  it("creates localized hrefs while preserving query strings and hashes", () => {
    expect(buildLocalizedPath("en", "/visit?tab=guide#map")).toBe("/stay?tab=guide#map");
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
    expect(buildLocalizedPath("en", "/auth/reset-password")).toBe("/auth/reset-password");
    expect(buildLocalizedPath("fr", "/signup")).toBe("/fr/signup");
    expect(shouldBypassLocalePrefix("/auth/reset-password")).toBe(false);
    expect(shouldBypassLocalePrefix("/hero-image.webp")).toBe(true);
    expect(shouldBypassLocalePrefix("/visit")).toBe(false);
  });

  it("canonicalizes known localized alias routes before returning hrefs", () => {
    expect(buildLocalizedPath("en", "/directory?category=restaurants")).toBe(
      "/stay?category=restaurants",
    );
    expect(buildLocalizedPath("fr", "/live")).toBe("/fr/residence");
    expect(buildLocalizedPath("en", "/real-estate/sample-listing")).toBe(
      "/listing/sample-listing",
    );
    expect(buildLocalizedPath("pt-pt", "/en/directory?category=golf")).toBe(
      "/stay?category=golf",
    );
  });
});
