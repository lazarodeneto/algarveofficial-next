import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const source = readFileSync(
  join(process.cwd(), "legacy-pages/admin/cms/AdminPageBuilder.tsx"),
  "utf8",
);

describe("Full Page Builder hero media UI contract", () => {
  it("uses clear admin labels for image, poster, video, and reset controls", () => {
    expect(source).toContain("Upload Hero Background Image");
    expect(source).toContain("Upload Poster / Fallback Image");
    expect(source).toContain("Upload Hero Background Video");
    expect(source).toContain("Reset to Black Background");
    expect(source).toContain("None / Black background");
  });

  it("does not promote poster uploads into hero image mode", () => {
    expect(source).not.toContain('setPageTextValue("hero.mediaType", "poster")');
    expect(source).not.toContain('setPageTextValue("hero.imageUrl", publicUrl);\n        }');
  });
});
