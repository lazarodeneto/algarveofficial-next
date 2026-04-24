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
});
