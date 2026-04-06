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
