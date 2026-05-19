import { describe, expect, it, vi } from "vitest";

vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");

import {
  buildListingGalleryImages,
  buildTieredListingGalleryImages,
  getCanonicalImageKey,
  getAllowedListingGalleryImageInputs,
  getListingGalleryThumbnails,
  normalizeListingGalleryTier,
} from "./gallery-images";

function imageInput(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `image-${index + 1}`,
    image_url: `https://example.com/gallery-${index + 1}.jpg`,
    display_order: index + 1,
  }));
}

describe("listing gallery images", () => {
  it("removes exact duplicate URLs and trims whitespace", () => {
    const images = buildListingGalleryImages({
      galleryImages: [
        { id: "one", image_url: "https://example.com/a.jpg" },
        { id: "two", image_url: " https://example.com/a.jpg " },
      ],
    });

    expect(images.map((image) => image.image_url)).toEqual(["https://example.com/a.jpg"]);
    expect(images[0]?.id).toBe("one");
  });

  it("normalizes protocol-relative URLs and dedupes them against https URLs", () => {
    const images = buildListingGalleryImages({
      galleryImages: [
        { id: "one", image_url: "//example.com/b.jpg" },
        { id: "two", image_url: "https://example.com/b.jpg" },
      ],
    });

    expect(images.map((image) => image.image_url)).toEqual(["https://example.com/b.jpg"]);
  });

  it("dedupes URLs that only differ by common image transform parameters", () => {
    const images = buildListingGalleryImages({
      galleryImages: [
        { id: "one", image_url: "https://example.com/a.jpg?w=800&q=80" },
        { id: "two", image_url: "https://example.com/a.jpg?width=1200&quality=90" },
      ],
    });

    expect(images).toHaveLength(1);
    expect(getCanonicalImageKey(images[0]!.image_url)).toBe("https://example.com/a.jpg");
  });

  it("keeps the featured image first and removes matching gallery thumbnails", () => {
    const images = buildListingGalleryImages({
      featuredImageUrl: "https://example.com/featured.jpg",
      galleryImages: [
        { id: "gallery-featured", image_url: "https://example.com/featured.jpg?w=800" },
        { id: "gallery-two", image_url: "https://example.com/two.jpg" },
      ],
      listingName: "Praia da Marinha",
    });

    expect(images.map((image) => image.image_url)).toEqual([
      "https://example.com/featured.jpg",
      "https://example.com/two.jpg",
    ]);
    expect(images[0]?.source).toBe("featured");
    expect(images[0]?.alt_text).toBe("Praia da Marinha");
  });

  it("uses fallback only when no real listing images exist", () => {
    const withRealImage = buildListingGalleryImages({
      featuredImageUrl: "https://example.com/real.jpg",
      fallbackImageUrl: "https://example.com/fallback.jpg",
    });
    const withFallbackOnly = buildListingGalleryImages({
      galleryImages: [{ id: "empty", image_url: " " }],
      fallbackImageUrl: "https://example.com/fallback.jpg",
    });

    expect(withRealImage.map((image) => image.image_url)).toEqual(["https://example.com/real.jpg"]);
    expect(withFallbackOnly.map((image) => image.image_url)).toEqual(["https://example.com/fallback.jpg"]);
    expect(withFallbackOnly[0]?.source).toBe("fallback");
  });

  it("preserves the order of first unique gallery images", () => {
    const images = buildListingGalleryImages({
      galleryImages: [
        { id: "one", image_url: "https://example.com/a.jpg", display_order: 10 },
        { id: "two", image_url: "https://example.com/b.jpg", display_order: 20 },
        { id: "three", image_url: "https://example.com/a.jpg", display_order: 30 },
      ],
    });

    expect(images.map((image) => image.id)).toEqual(["one", "two"]);
  });

  it("excludes the current main image from thumbnail selections", () => {
    const images = buildListingGalleryImages({
      galleryImages: [
        { id: "one", image_url: "https://example.com/a.jpg" },
        { id: "two", image_url: "https://example.com/b.jpg" },
        { id: "three", image_url: "https://example.com/c.jpg" },
      ],
    });
    const thumbnails = getListingGalleryThumbnails(images, 0, 4);

    expect(thumbnails.map(({ image }) => image.image_url)).toEqual([
      "https://example.com/b.jpg",
      "https://example.com/c.jpg",
    ]);
  });

  it("dedupes Supabase render and object URLs by storage path", () => {
    const images = buildListingGalleryImages({
      galleryImages: [
        {
          id: "object",
          image_url: "https://example.supabase.co/storage/v1/object/public/listing-images/demo/beach.jpg",
        },
        {
          id: "render",
          image_url:
            "https://example.supabase.co/storage/v1/render/image/public/listing-images/demo/beach.jpg?width=800&quality=80",
        },
      ],
    });

    expect(images).toHaveLength(1);
    expect(images[0]?.id).toBe("object");
  });

  it("dedupes asset-like duplicate alt text across different storage URLs", () => {
    const images = buildListingGalleryImages({
      galleryImages: [
        {
          id: "first",
          image_url: "https://example.com/storage/one.webp",
          alt_text: "AlgarveOfficial-praiadamarinha2",
          display_order: 1,
        },
        {
          id: "visual-duplicate",
          image_url: "https://example.com/storage/two.webp",
          alt_text: "AlgarveOfficial-praiadamarinha2",
          display_order: 2,
        },
        {
          id: "different",
          image_url: "https://example.com/storage/three.webp",
          alt_text: "AlgarveOfficial-praiadamarinha3",
          display_order: 3,
        },
      ],
    });

    expect(images.map((image) => image.id)).toEqual(["first", "different"]);
  });

  it("dedupes copied asset alt names with numeric copy suffixes", () => {
    const images = buildListingGalleryImages({
      galleryImages: [
        {
          id: "original",
          image_url: "https://example.com/storage/original.webp",
          alt_text: "alvorgolfshop-2-1240x930",
        },
        {
          id: "copy",
          image_url: "https://example.com/storage/copy.webp",
          alt_text: "alvorgolfshop-2-1240x930 (1)",
        },
      ],
    });

    expect(images.map((image) => image.id)).toEqual(["original"]);
  });

  it("does not collapse generic listing-name fallback alt text with digits", () => {
    const images = buildListingGalleryImages({
      listingName: "3HB Faro",
      galleryImages: [
        { id: "one", image_url: "https://example.com/one.jpg" },
        { id: "two", image_url: "https://example.com/two.jpg" },
      ],
    });

    expect(images.map((image) => image.id)).toEqual(["one", "two"]);
  });

  it("limits unverified listings to one public image and disables gallery modal", () => {
    const result = buildTieredListingGalleryImages({
      tier: "unverified",
      galleryImages: imageInput(8),
    });

    expect(result.images).toHaveLength(1);
    expect(result.policy).toMatchObject({
      tier: "unverified",
      maxImages: 1,
      layout: "single",
      canOpenGalleryModal: false,
    });
  });

  it("limits verified listings to ten images and uses featured grid above five images", () => {
    const result = buildTieredListingGalleryImages({
      tier: "verified",
      galleryImages: imageInput(12),
    });

    expect(result.images).toHaveLength(10);
    expect(result.policy).toMatchObject({
      tier: "verified",
      maxImages: 10,
      layout: "featured-grid",
      canOpenGalleryModal: true,
    });
  });

  it("limits signature listings to twenty images and uses featured grid above five images", () => {
    const result = buildTieredListingGalleryImages({
      tier: "signature",
      galleryImages: imageInput(30),
    });

    expect(result.images).toHaveLength(20);
    expect(result.policy).toMatchObject({
      tier: "signature",
      maxImages: 20,
      layout: "featured-grid",
      canOpenGalleryModal: true,
    });
  });

  it("keeps verified listings with five images on the standard layout", () => {
    const result = buildTieredListingGalleryImages({
      tier: "verified",
      galleryImages: imageInput(5),
    });

    expect(result.images).toHaveLength(5);
    expect(result.policy.layout).toBe("standard");
  });

  it("uses the featured grid for verified listings with six unique images", () => {
    const result = buildTieredListingGalleryImages({
      tier: "verified",
      galleryImages: imageInput(6),
    });

    expect(result.images).toHaveLength(6);
    expect(result.policy.layout).toBe("featured-grid");
  });

  it("dedupes before applying the tier limit", () => {
    const result = buildTieredListingGalleryImages({
      tier: "verified",
      galleryImages: [
        { id: "one", image_url: "https://example.com/a.jpg?w=800", display_order: 0 },
        { id: "duplicate", image_url: "https://example.com/a.jpg?width=1200", display_order: 1 },
        ...imageInput(10),
      ],
    });

    expect(result.images).toHaveLength(10);
    expect(result.images.map((image) => image.id)).not.toContain("duplicate");
    expect(result.images[0]?.image_url).toBe("https://example.com/a.jpg?w=800");
  });

  it("defaults unknown and free tiers to unverified", () => {
    expect(normalizeListingGalleryTier("free")).toBe("unverified");
    expect(normalizeListingGalleryTier("unexpected")).toBe("unverified");

    const result = buildTieredListingGalleryImages({
      tier: "free",
      galleryImages: imageInput(4),
    });

    expect(result.images).toHaveLength(1);
    expect(result.policy.tier).toBe("unverified");
  });

  it("uses fallback only when no real image exists and never repeats it", () => {
    const result = buildTieredListingGalleryImages({
      tier: "signature",
      galleryImages: [{ id: "empty", image_url: "" }],
      fallbackImageUrl: "https://example.com/fallback.jpg",
    });

    expect(result.images).toHaveLength(1);
    expect(result.images[0]?.source).toBe("fallback");
    expect(result.images[0]?.image_url).toBe("https://example.com/fallback.jpg");
  });

  it("filters raw gallery input rows to the public tier allowance", () => {
    const allowedRows = getAllowedListingGalleryImageInputs({
      tier: "verified",
      featuredImageUrl: "https://example.com/featured.jpg",
      galleryImages: imageInput(12),
      listingName: "Verified listing",
    });

    expect(allowedRows).toHaveLength(9);
    expect(allowedRows.map((image) => image.id)).toEqual([
      "image-1",
      "image-2",
      "image-3",
      "image-4",
      "image-5",
      "image-6",
      "image-7",
      "image-8",
      "image-9",
    ]);
  });

  it("does not return duplicate raw gallery rows for the same canonical image", () => {
    const allowedRows = getAllowedListingGalleryImageInputs({
      tier: "verified",
      galleryImages: [
        { id: "first", image_url: "https://example.com/a.jpg?w=800", display_order: 1 },
        { id: "duplicate", image_url: "https://example.com/a.jpg?width=1200", display_order: 2 },
        { id: "second", image_url: "https://example.com/b.jpg", display_order: 3 },
      ],
      listingName: "Verified listing",
    });

    expect(allowedRows.map((image) => image.id)).toEqual(["first", "second"]);
  });
});
