import { describe, expect, it, vi } from "vitest";

vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");

import {
  getSafeCmsImageSrc,
  normalizeCmsImageFieldsInValue,
  normalizeCmsImageSrc,
} from "@/lib/cms/image-source";

describe("CMS image source normalization", () => {
  it("treats missing and blank image values as empty", () => {
    expect(getSafeCmsImageSrc(null)).toBeNull();
    expect(getSafeCmsImageSrc(undefined)).toBeNull();
    expect(getSafeCmsImageSrc("")).toBeNull();
    expect(getSafeCmsImageSrc("   ")).toBeNull();
  });

  it("normalizes public image paths", () => {
    expect(getSafeCmsImageSrc("images/foo.webp")).toBe("/images/foo.webp");
    expect(getSafeCmsImageSrc("/images/foo.webp")).toBe("/images/foo.webp");
    expect(getSafeCmsImageSrc("public/images/foo.webp")).toBe("/images/foo.webp");
    expect(getSafeCmsImageSrc("/pt-pt/images/foo.webp")).toBe("/images/foo.webp");
    expect(getSafeCmsImageSrc("/images/foo bar.webp")).toBe("/images/foo%20bar.webp");
  });

  it("normalizes Supabase public storage paths and URLs", () => {
    expect(getSafeCmsImageSrc("page-builder/golf/card.webp")).toBe(
      "https://project.supabase.co/storage/v1/object/public/media/page-builder/golf/card.webp",
    );
    expect(getSafeCmsImageSrc("listing-images/demo.webp", { bucket: "listing-images" })).toBe(
      "https://project.supabase.co/storage/v1/object/public/listing-images/demo.webp",
    );
    expect(
      normalizeCmsImageSrc("https://project.supabase.co/storage/v1/object/public/media/foo.webp").kind,
    ).toBe("supabase-public-url");
  });

  it("accepts only allowed stable external HTTPS image URLs", () => {
    expect(getSafeCmsImageSrc("https://images.unsplash.com/photo.jpg")).toBe(
      "https://images.unsplash.com/photo.jpg",
    );
    expect(getSafeCmsImageSrc("http://images.unsplash.com/photo.jpg")).toBeNull();
    expect(getSafeCmsImageSrc("https://unsupported.example/photo.jpg")).toBeNull();
  });

  it("rejects temporary, signed, and local filesystem URLs", () => {
    expect(getSafeCmsImageSrc("blob:http://localhost/image")).toBeNull();
    expect(getSafeCmsImageSrc("data:image/png;base64,abc")).toBeNull();
    expect(getSafeCmsImageSrc("file:///Users/mini/image.jpg")).toBeNull();
    expect(
      getSafeCmsImageSrc("https://project.supabase.co/storage/v1/object/sign/media/foo.webp?token=abc"),
    ).toBeNull();
  });

  it("normalizes nested CMS image fields while preserving reset empties", () => {
    expect(
      normalizeCmsImageFieldsInValue({
        hero: {
          imageUrl: "images/hero.webp",
          posterUrl: "",
          title: "Golf",
        },
        blocks: {
          discovery: {
            data: {
              cards: [
                { imageUrl: "public/images/card.webp" },
                { imageUrl: "https://unsupported.example/card.webp" },
              ],
            },
          },
        },
      }),
    ).toEqual({
      hero: {
        imageUrl: "/images/hero.webp",
        posterUrl: "",
        title: "Golf",
      },
      blocks: {
        discovery: {
          data: {
            cards: [{ imageUrl: "/images/card.webp" }, { imageUrl: "" }],
          },
        },
      },
    });
  });
});
