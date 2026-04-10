import { describe, expect, it } from "vitest";

import { localizeCanonicalUrl, localizeSeoUrl } from "@/lib/seoUrls";

describe("seo locale url helpers", () => {
  it("localizes same-origin urls when a locale is provided", () => {
    expect(localizeSeoUrl("https://algarveofficial.com/blog/post", "fr")).toBe(
      "https://algarveofficial.com/fr/blog/post",
    );
    expect(localizeSeoUrl("https://algarveofficial.com/fr/blog/post", "fr")).toBe(
      "https://algarveofficial.com/fr/blog/post",
    );
  });

  it("leaves urls unchanged when locale is omitted or external", () => {
    expect(localizeSeoUrl("https://algarveofficial.com/blog/post")).toBe(
      "https://algarveofficial.com/blog/post",
    );
    expect(localizeSeoUrl("https://example.com/blog/post", "fr")).toBe(
      "https://example.com/blog/post",
    );
  });

  it("localizes canonical urls without relying on window state", () => {
    expect(localizeCanonicalUrl("https://algarveofficial.com/contact", "pt-pt")).toBe(
      "https://algarveofficial.com/pt-pt/contact",
    );
  });
});
