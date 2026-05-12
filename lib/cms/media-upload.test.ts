import { describe, expect, it } from "vitest";

import {
  buildCmsHeroUploadPath,
  slugifyCmsFileName,
  validateCmsHeroUploadFile,
} from "@/lib/cms/media-upload";

describe("CMS media upload helpers", () => {
  it("rejects unsupported image MIME types", () => {
    const result = validateCmsHeroUploadFile({
      target: "image",
      contentType: "image/gif",
      fileName: "hero.gif",
      size: 1024,
    });

    expect(result).toEqual({
      ok: false,
      code: "UNSUPPORTED_MEDIA_TYPE",
      message: expect.stringContaining("Hero image uploads"),
    });
  });

  it("accepts supported image uploads", () => {
    const result = validateCmsHeroUploadFile({
      target: "poster",
      contentType: "image/webp",
      fileName: "Praia do Camilo.webp",
      size: 2048,
    });

    expect(result).toEqual({
      ok: true,
      contentType: "image/webp",
      extension: "webp",
    });
  });

  it("rejects oversized videos", () => {
    const result = validateCmsHeroUploadFile({
      target: "video",
      contentType: "video/mp4",
      fileName: "hero.mp4",
      size: 101 * 1024 * 1024,
    });

    expect(result).toEqual({
      ok: false,
      code: "FILE_TOO_LARGE",
      message: expect.stringContaining("100MB"),
    });
  });

  it("builds deterministic SEO-friendly storage paths", () => {
    const path = buildCmsHeroUploadPath({
      pageId: "beaches",
      target: "image",
      fileName: "Praia do Camilo verão.webp",
      extension: "webp",
      now: new Date("2026-05-11T12:34:56.000Z"),
    });

    expect(path).toBe(
      "cms/pages/beaches/hero/20260511T123456000Z-image-praia-do-camilo-verao.webp",
    );
  });

  it("slugifies CMS filenames safely", () => {
    expect(slugifyCmsFileName("  My Hero Photo!!.jpg  ")).toBe("my-hero-photo");
  });
});
