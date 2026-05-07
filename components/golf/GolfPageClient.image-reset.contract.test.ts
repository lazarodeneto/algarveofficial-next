import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const GOLF_PAGE_CLIENT_PATH = join(
  process.cwd(),
  "components",
  "golf",
  "GolfPageClient.tsx",
);

describe("golf page hero image reset contract", () => {
  it("does not apply the static golf hero fallback when CMS media is empty", () => {
    const source = readFileSync(GOLF_PAGE_CLIENT_PATH, "utf8");

    expect(source).toContain("<HeroBackgroundMedia");
    expect(source).toContain("getSafeCmsImageSrc");
    expect(source).toContain('hasOwnKey(override, "imageUrl") ? override.imageUrl : ""');
    expect(source).toContain(": option.imageUrl");
    expect(source).not.toContain('import { PageHeroImage } from "@/components/sections/PageHeroImage";');
    expect(source).not.toContain('fallback={<PageHeroImage page="golf"');
  });
});
