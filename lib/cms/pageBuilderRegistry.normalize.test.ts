import { describe, expect, it } from "vitest";

import { normalizeCmsPageConfigs } from "@/lib/cms/pageBuilderRegistry";

describe("normalizeCmsPageConfigs", () => {
  it("migrates legacy all-active-city-hubs blocks to canonical all-city-hubs", () => {
    const normalized = normalizeCmsPageConfigs({
      live: {
        blocks: {
          "all-active-city-hubs": {
            enabled: false,
            className: "legacy-block",
          },
        },
      },
    });

    expect(normalized.live?.blocks?.["all-city-hubs"]).toEqual({
      enabled: false,
      className: "legacy-block",
    });
    expect(normalized.live?.blocks?.["all-active-city-hubs"]).toBeUndefined();
  });

  it("keeps canonical block values when both canonical and legacy IDs exist", () => {
    const normalized = normalizeCmsPageConfigs({
      invest: {
        blocks: {
          "all-city-hubs": {
            enabled: true,
            className: "canonical",
          },
          "all-active-city-hubs": {
            enabled: false,
            className: "legacy",
          },
        },
      },
    });

    expect(normalized.invest?.blocks?.["all-city-hubs"]).toEqual({
      enabled: true,
      className: "canonical",
    });
  });

  it("migrates legacy golf block ids to the new canonical golf layout blocks", () => {
    const normalized = normalizeCmsPageConfigs({
      golf: {
        blocks: {
          results: {
            enabled: false,
            className: "legacy-results",
          },
          filters: {
            enabled: true,
          },
          "featured-city-hub": {
            enabled: true,
          },
        },
      },
    });

    expect(normalized.golf?.blocks?.["featured-courses"]).toEqual({
      enabled: false,
      className: "legacy-results",
    });
    expect(normalized.golf?.blocks?.["course-tools"]).toEqual({
      enabled: true,
    });
    expect(normalized.golf?.blocks?.leaderboard).toEqual({
      enabled: true,
    });
    expect(normalized.golf?.blocks?.results).toBeUndefined();
    expect(normalized.golf?.blocks?.filters).toBeUndefined();
    expect(normalized.golf?.blocks?.["featured-city-hub"]).toBeUndefined();
  });

  it("drops unknown pages and unknown blocks from persisted payloads", () => {
    const normalized = normalizeCmsPageConfigs({
      "not-a-real-page": {
        blocks: {
          hero: {
            enabled: true,
          },
        },
      },
      home: {
        blocks: {
          "not-a-real-block": {
            enabled: true,
          },
          hero: {
            enabled: false,
          },
        },
      },
    });

    expect(normalized["not-a-real-page"]).toBeUndefined();
    expect(normalized.home?.blocks?.["not-a-real-block"]).toBeUndefined();
    expect(normalized.home?.blocks?.hero).toEqual({ enabled: false });
  });

  it("preserves hero settings and nested JSON-safe block data", () => {
    const normalized = normalizeCmsPageConfigs({
      golf: {
        hero: {
          mediaType: "image",
          imageUrl: "https://example.com/hero.webp",
          title: "Golf Hero",
        },
        blocks: {
          discovery: {
            enabled: true,
            data: {
              title: "Find golf",
              cards: [
                {
                  tag: "championship",
                  title: "Championship",
                  enabled: true,
                  meta: {
                    imageUrl: "https://example.com/card.webp",
                  },
                },
              ],
            },
          },
        },
      },
    });

    expect(normalized.golf?.hero).toEqual({
      mediaType: "image",
      imageUrl: "https://example.com/hero.webp",
      title: "Golf Hero",
    });
    expect(normalized.golf?.blocks?.discovery?.data).toEqual({
      title: "Find golf",
      cards: [
        {
          tag: "championship",
          title: "Championship",
          enabled: true,
          meta: {
            imageUrl: "https://example.com/card.webp",
          },
        },
      ],
    });
  });

  it("normalizes modern sections into legacy runtime blocks while preserving disabled hero", () => {
    const normalized = normalizeCmsPageConfigs({
      beaches: {
        sections: {
          hero: {
            enabled: false,
            imageUrl: "https://images.unsplash.com/beach.jpg",
            title: "CMS Beaches",
          },
          filters: {
            enabled: false,
            mode: "compact",
          },
        },
      },
    });

    expect(normalized.beaches?.hero).toEqual({
      enabled: false,
      imageUrl: "https://images.unsplash.com/beach.jpg",
      title: "CMS Beaches",
    });
    expect(normalized.beaches?.blocks?.hero).toEqual({
      enabled: false,
      data: {
        imageUrl: "https://images.unsplash.com/beach.jpg",
        title: "CMS Beaches",
      },
    });
    expect(normalized.beaches?.blocks?.filters).toEqual({
      enabled: false,
      data: {
        mode: "compact",
      },
    });
  });

  it("lets canonical blocks override section-derived block values", () => {
    const normalized = normalizeCmsPageConfigs({
      beaches: {
        sections: {
          hero: {
            enabled: false,
            title: "Section title",
          },
        },
        blocks: {
          hero: {
            enabled: true,
          },
        },
      },
    });

    expect(normalized.beaches?.hero?.enabled).toBe(false);
    expect(normalized.beaches?.blocks?.hero).toEqual({ enabled: true });
  });
});
