import { describe, expect, it } from "vitest";
import { buildCanonicalUrl, buildMetadataAlternates } from "@/lib/i18n/seo";
import { buildMetadata } from "@/lib/metadata";

describe("i18n SEO helpers", () => {
  it("canonicalizes English URLs with the /en prefix to match public redirects", () => {
    expect(buildCanonicalUrl("en", "/directory")).toBe(
      "https://algarveofficial.com/en/directory",
    );
  });

  it("uses the same canonical in alternates and metadata for localized English pages", () => {
    const alternates = buildMetadataAlternates("en", "/directory");
    const metadata = buildMetadata({
      title: "Directory",
      path: "/directory",
      localeCode: "en",
    });

    expect(alternates.canonical).toBe(
      "https://algarveofficial.com/en/directory",
    );
    expect(metadata.alternates?.canonical).toBe(alternates.canonical);
    expect(metadata.openGraph?.url).toBe(alternates.canonical);
  });
});
