import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { SUPPORTED_LOCALES } from "@/lib/i18n/config";

const PAGE_SOURCE = readFileSync(
  join(process.cwd(), "app", "[locale]", "page.tsx"),
  "utf8",
);

function readHomeMetadata() {
  const metadataStart = PAGE_SOURCE.indexOf("const HOME_METADATA");
  const metadataEnd = PAGE_SOURCE.indexOf("export async function generateMetadata", metadataStart);

  expect(metadataStart).toBeGreaterThanOrEqual(0);
  expect(metadataEnd).toBeGreaterThan(metadataStart);

  const metadataSource = PAGE_SOURCE.slice(metadataStart, metadataEnd);
  const entries = new Map<string, { title: string; description: string }>();
  const entryPattern =
    /^\s*(?:"([^"]+)"|([a-z]{2})):\s*\{\s*title:\s*"([^"]+)",\s*description:\s*\n\s*"([^"]+)",\s*\},/gm;

  for (const match of metadataSource.matchAll(entryPattern)) {
    const locale = match[1] ?? match[2];
    const title = match[3];
    const description = match[4];

    if (locale && title && description) {
      entries.set(locale, { title, description });
    }
  }

  return entries;
}

describe("homepage localized metadata", () => {
  it("defines title and description metadata for every supported locale", () => {
    const metadata = readHomeMetadata();

    expect([...metadata.keys()].sort()).toEqual([...SUPPORTED_LOCALES].sort());

    for (const locale of SUPPORTED_LOCALES) {
      const entry = metadata.get(locale);
      expect(entry?.title.trim()).toBeTruthy();
      expect(entry?.description.trim()).toBeTruthy();
    }
  });

  it("keeps localized share titles aligned with stay, eat, and invest positioning", () => {
    const metadata = readHomeMetadata();
    const oldLuxuryGolfRestaurantTitlePattern =
      /AlgarveOfficial\s*\||villas?|villen|ville di|lyxvillor|luksusvillaer|golf(?:e|baner|banor)?|restaurants?|restaurantes|ristoranti|restauranger/i;

    for (const [locale, entry] of metadata) {
      if (locale === "en") continue;
      expect(entry.title).not.toMatch(oldLuxuryGolfRestaurantTitlePattern);
    }
  });

  it("keeps descriptions within the metadata builder non-truncation limit", () => {
    const metadata = readHomeMetadata();

    for (const [locale, entry] of metadata) {
      expect(entry.description.length, `${locale} description length`).toBeLessThanOrEqual(155);
    }
  });
});
