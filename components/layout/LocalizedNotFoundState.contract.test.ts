import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const NOT_FOUND_STATE_SOURCE = readFileSync(
  join(process.cwd(), "components", "layout", "LocalizedNotFoundState.tsx"),
  "utf8",
);

const ROOT_NOT_FOUND_SOURCE = readFileSync(
  join(process.cwd(), "app", "not-found.tsx"),
  "utf8",
);

const LOCALE_NOT_FOUND_SOURCE = readFileSync(
  join(process.cwd(), "app", "[locale]", "not-found.tsx"),
  "utf8",
);

describe("LocalizedNotFoundState", () => {
  it("keeps the custom 404 scoped to the not-found content surface", () => {
    expect(NOT_FOUND_STATE_SOURCE).toContain("region-carvoeiro-800w-CVkjcyBE.webp");
    expect(NOT_FOUND_STATE_SOURCE).toContain("videos.pexels.com/video-files/36749580");
    expect(NOT_FOUND_STATE_SOURCE).toContain("Oops! This page went off exploring the Algarve.");
    expect(NOT_FOUND_STATE_SOURCE).toContain("The page you’re looking for may have moved");
    expect(NOT_FOUND_STATE_SOURCE).toContain("Go to Homepage");
    expect(NOT_FOUND_STATE_SOURCE).toContain("Explore Beaches");
    expect(NOT_FOUND_STATE_SOURCE).toContain("Open Map");
    expect(NOT_FOUND_STATE_SOURCE).toContain("View Experiences");
    expect(NOT_FOUND_STATE_SOURCE).not.toContain("@/components/layout/Header");
    expect(NOT_FOUND_STATE_SOURCE).not.toContain("PublicSiteFrame");
  });

  it("passes locale-aware internal routes into the 404 links", () => {
    for (const source of [ROOT_NOT_FOUND_SOURCE, LOCALE_NOT_FOUND_SOURCE]) {
      expect(source).toContain('buildStaticRoutePath("home", locale)');
      expect(source).toContain('buildStaticRoutePath("beaches", locale)');
      expect(source).toContain('buildStaticRoutePath("map", locale)');
      expect(source).toContain('buildStaticRoutePath("experiences", locale)');
    }
  });
});
