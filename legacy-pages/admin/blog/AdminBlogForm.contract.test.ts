import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const SOURCE = readFileSync(
  join(process.cwd(), "legacy-pages", "admin", "blog", "AdminBlogForm.tsx"),
  "utf8",
);

describe("AdminBlogForm featured image upload", () => {
  it("wires the featured image dropzone to a real media bucket upload", () => {
    expect(SOURCE).toContain("featuredImageInputRef");
    expect(SOURCE).toContain("handleFeaturedImageUpload");
    expect(SOURCE).toContain('accept="image/avif,image/jpeg,image/png,image/webp"');
    expect(SOURCE).toContain("onClick={openFeaturedImagePicker}");
    expect(SOURCE).toContain('const BLOG_FEATURED_IMAGE_BUCKET = "media"');
    expect(SOURCE).toContain(".from(BLOG_FEATURED_IMAGE_BUCKET)");
    expect(SOURCE).toContain(".upload(storagePath, preparedFile");
    expect(SOURCE).toContain('"Click to upload image"');
  });
});
