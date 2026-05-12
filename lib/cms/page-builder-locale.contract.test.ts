import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = process.cwd();
const ADMIN_PAGE_BUILDER_PATH = join(
  REPO_ROOT,
  "legacy-pages",
  "admin",
  "cms",
  "AdminPageBuilder.tsx",
);

describe("cms page builder locale contract", () => {
  it("reads and writes CMS settings with active locale context", () => {
    const source = readFileSync(ADMIN_PAGE_BUILDER_PATH, "utf8");

    expect(source).toContain("const locale = useCurrentLocale()");
    expect(source).toContain("useGlobalSettings({");
    expect(source).toContain("locale,");
  });

  it("keeps page selection and the page query param in one guarded transition", () => {
    const source = readFileSync(ADMIN_PAGE_BUILDER_PATH, "utf8");

    expect(source).toContain("pendingSelectedPageIdRef");
    expect(source).toContain("const handlePageSelection = (nextPageId: string) => {");
    expect(source).toContain('next.set("page", nextPageId);');
    expect(source).toContain('next.delete("mode");');
    expect(source).toContain("onClick={() => handlePageSelection(page.id)}");
  });

  it("lets golf top cards upload images into the CMS media bucket", () => {
    const source = readFileSync(ADMIN_PAGE_BUILDER_PATH, "utf8");

    expect(source).toContain("const ImageUrlUploadField = lazy(() =>");
    expect(source).toContain('import("@/components/admin/ImageUrlUploadField")');
    expect(source).toContain("Edit card titles, descriptions, uploaded images, links");
    expect(source).toContain('bucket="media"');
    expect(source).toContain('folder={`page-builder/golf/top-cards/${card.tag}`}');
    expect(source).toContain('setGolfDiscoveryCardValue(block.id, card.tag, "imageUrl", value)');
    expect(source).toContain("getSafeCmsImageSrc(card.imageUrl)");
    expect(source).toContain('placeholder="Leave blank to render black"');
    expect(source).not.toContain("Using frontend fallback image.");
    expect(source).not.toContain("Leave blank to use course/fallback image");
  });

  it("persists golf hero media resets as intentional empty values", () => {
    const source = readFileSync(ADMIN_PAGE_BUILDER_PATH, "utf8");

    expect(source).toContain("const resetHeroMedia = () => {");
    expect(source).toContain("setIsCmsDirty(true);");
    expect(source).toContain('nextText["hero.imageUrl"] = clearedHeroMedia.imageUrl;');
    expect(source).toContain('Object.prototype.hasOwnProperty.call(textMap, "hero.imageUrl")');
    expect(source).toContain('heroData.imageUrl = textMap["hero.imageUrl"];');
    expect(source).not.toContain('fallback={<PageHeroImage page="golf"');
    expect(source).not.toContain('if (textMap["hero.imageUrl"]) {');
  });
});
