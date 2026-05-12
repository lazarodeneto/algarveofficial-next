import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import sitemap from "./sitemap";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import {
  getProgrammaticCategoryCityIndexEntries,
  getProgrammaticCityIndexEntries,
} from "@/lib/seo/programmatic/category-city-data";

vi.mock("@/lib/supabase/public-server", () => ({
  createPublicServerClient: vi.fn(),
}));

vi.mock("@/lib/seo/programmatic/category-city-data", () => ({
  getProgrammaticCityIndexEntries: vi.fn(),
  getProgrammaticCategoryCityIndexEntries: vi.fn(),
}));

const mockedCreatePublicServerClient = vi.mocked(createPublicServerClient);
const mockedGetProgrammaticCityIndexEntries = vi.mocked(getProgrammaticCityIndexEntries);
const mockedGetProgrammaticCategoryCityIndexEntries = vi.mocked(getProgrammaticCategoryCityIndexEntries);

function createSitemapQuery(data: unknown[]) {
  return {
    select() {
      return this;
    },
    eq() {
      return this;
    },
    not() {
      return this;
    },
    order() {
      return this;
    },
    limit: async () => ({ data, error: null }),
  };
}

describe("sitemap slug SEO", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://algarveofficial.com";
    mockedGetProgrammaticCityIndexEntries.mockResolvedValue([]);
    mockedGetProgrammaticCategoryCityIndexEntries.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it("emits canonical unprefixed English URLs with valid localized hreflang alternates", async () => {
    mockedCreatePublicServerClient.mockReturnValue({
      from(table: string) {
        if (table === "listings") {
          return createSitemapQuery([
            {
              slug: "the-els-club-vilamoura",
              updated_at: "2026-05-01T00:00:00.000Z",
              published_at: "2026-04-01T00:00:00.000Z",
              featured_image_url: null,
            },
          ]);
        }
        if (table === "regions") {
          return createSitemapQuery([
            {
              slug: "golden-triangle",
              updated_at: "2026-05-01T00:00:00.000Z",
              image_url: null,
            },
          ]);
        }
        if (table === "cities") {
          return createSitemapQuery([
            {
              slug: "lagos",
              updated_at: "2026-05-01T00:00:00.000Z",
              image_url: null,
            },
          ]);
        }
        if (table === "categories") {
          return createSitemapQuery([
            {
              slug: "restaurants",
              updated_at: "2026-05-01T00:00:00.000Z",
              image_url: null,
            },
          ]);
        }
        return createSitemapQuery([]);
      },
    } as never);

    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain("https://algarveofficial.com/listing/the-els-club-vilamoura");
    expect(urls).toContain("https://algarveofficial.com/visit/lagos");
    expect(urls).toContain("https://algarveofficial.com/destinations/golden-triangle");
    expect(urls).toContain("https://algarveofficial.com/category/restaurants");
    expect(urls).toContain("https://algarveofficial.com/properties");
    expect(urls).not.toContain("https://algarveofficial.com/real-estate");
    expect(urls.some((url) => new URL(url).pathname.startsWith("/en/"))).toBe(false);

    const listingEntry = entries.find((entry) => entry.url.endsWith("/listing/the-els-club-vilamoura"));
    expect(listingEntry?.alternates?.languages).toMatchObject({
      en: "https://algarveofficial.com/listing/the-els-club-vilamoura",
      "pt-PT": "https://algarveofficial.com/pt-pt/listing/the-els-club-vilamoura",
      "x-default": "https://algarveofficial.com/listing/the-els-club-vilamoura",
    });
  });
});
