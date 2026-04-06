import { describe, expect, it } from "vitest";
import { buildCanonicalUrl, buildMetadataAlternates } from "@/lib/i18n/seo";
import { buildMetadata } from "@/lib/metadata";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";

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

  it("produces stable canonical/hreflang alternates for representative localized routes", () => {
    const enStay = buildMetadata({
      title: "Stay",
      path: "/stay",
      localeCode: "en",
    });
    const ptStay = buildMetadata({
      title: "Stay",
      path: "/stay",
      localeCode: "pt-pt",
    });

    expect({
      canonical: enStay.alternates?.canonical,
      en: enStay.alternates?.languages?.en,
      pt: enStay.alternates?.languages?.["pt-PT"],
      xDefault: enStay.alternates?.languages?.["x-default"],
    }).toMatchInlineSnapshot(`
      {
        "canonical": "https://algarveofficial.com/en/stay",
        "en": "https://algarveofficial.com/en/stay",
        "pt": "https://algarveofficial.com/pt-pt/stay",
        "xDefault": "https://algarveofficial.com/en/stay",
      }
    `);
    expect({
      canonical: ptStay.alternates?.canonical,
      en: ptStay.alternates?.languages?.en,
      pt: ptStay.alternates?.languages?.["pt-PT"],
      xDefault: ptStay.alternates?.languages?.["x-default"],
    }).toMatchInlineSnapshot(`
      {
        "canonical": "https://algarveofficial.com/pt-pt/stay",
        "en": "https://algarveofficial.com/en/stay",
        "pt": "https://algarveofficial.com/pt-pt/stay",
        "xDefault": "https://algarveofficial.com/en/stay",
      }
    `);
  });

  it("keeps wrapper helpers aligned with the core App Router metadata builder", () => {
    const core = buildMetadata({
      title: "Partner Pricing",
      description: "Pricing details",
      path: "/pricing",
      localeCode: "fr",
    });
    const localizedWrapper = buildLocalizedMetadata({
      locale: "fr",
      path: "/pricing",
      title: "Partner Pricing",
      description: "Pricing details",
    });
    const advancedWrapper = buildPageMetadata({
      title: "Partner Pricing",
      description: "Pricing details",
      localizedPath: "/pricing",
      locale: "fr",
    });

    expect(localizedWrapper.alternates).toEqual(core.alternates);
    expect(localizedWrapper.openGraph?.url).toBe(core.openGraph?.url);
    expect(advancedWrapper.alternates).toEqual(core.alternates);
    expect(advancedWrapper.openGraph?.url).toBe(core.openGraph?.url);
  });
});
