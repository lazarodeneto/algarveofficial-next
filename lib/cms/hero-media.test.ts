import { describe, expect, it } from "vitest";

import {
  getHeroMediaRenderState,
  isValidYouTubeUrl,
  normalizeHeroMediaConfig,
  resetHeroMediaConfig,
} from "@/lib/cms/hero-media";

describe("hero media normalization", () => {
  it("normalizes an empty config to a black fallback state", () => {
    const media = normalizeHeroMediaConfig({});

    expect(media.type).toBe("none");
    expect(getHeroMediaRenderState(media)).toEqual({ kind: "none", reason: "missing" });
  });

  it("normalizes legacy image config", () => {
    const media = normalizeHeroMediaConfig({
      mediaType: "image",
      imageUrl: "images/hero.webp",
      posterUrl: "images/poster.webp",
    });

    expect(media.type).toBe("image");
    expect(media.imageUrl).toBe("/images/hero.webp");
    expect(getHeroMediaRenderState(media)).toMatchObject({
      kind: "image",
      imageUrl: "/images/hero.webp",
      source: "image",
    });
  });

  it("normalizes legacy poster-only config as an image for backwards compatibility", () => {
    const media = normalizeHeroMediaConfig({
      mediaType: "poster",
      posterUrl: "images/poster.webp",
    });

    expect(media.type).toBe("image");
    expect(getHeroMediaRenderState(media)).toMatchObject({
      kind: "image",
      imageUrl: "/images/poster.webp",
      source: "legacy-poster",
    });
  });

  it("uses poster as fallback for broken video media", () => {
    const media = normalizeHeroMediaConfig({
      mediaType: "video",
      videoUrl: "",
      posterUrl: "images/poster.webp",
    });

    expect(getHeroMediaRenderState(media)).toMatchObject({
      kind: "image",
      imageUrl: "/images/poster.webp",
      source: "poster-fallback",
    });
  });

  it("keeps YouTube validation explicit and safe", () => {
    expect(isValidYouTubeUrl("https://www.youtube.com/watch?v=abc123")).toBe(true);
    expect(isValidYouTubeUrl("https://example.com/watch?v=abc123")).toBe(false);
  });

  it("resets hero media and clears legacy flat fields", () => {
    const next = resetHeroMediaConfig({
      mediaType: "video",
      imageUrl: "images/hero.webp",
      videoUrl: "https://cdn.algarveofficial.com/hero.mp4",
      youtubeUrl: "https://www.youtube.com/watch?v=abc123",
      posterUrl: "images/poster.webp",
      hero: {
        mediaType: "video",
        imageUrl: "images/hero.webp",
      },
      text: {
        "hero.mediaType": "video",
        "hero.imageUrl": "images/hero.webp",
      },
    });

    expect(next.mediaType).toBe("none");
    expect(next.imageUrl).toBe("");
    expect(next.videoUrl).toBe("");
    expect(next.youtubeUrl).toBe("");
    expect(next.posterUrl).toBe("");
    expect(next.hero).toMatchObject({
      mediaType: "none",
      imageUrl: "",
      videoUrl: "",
      youtubeUrl: "",
      posterUrl: "",
    });
    expect(next.text).toMatchObject({
      "hero.mediaType": "none",
      "hero.imageUrl": "",
      "hero.videoUrl": "",
      "hero.youtubeUrl": "",
      "hero.posterUrl": "",
    });
  });
});
