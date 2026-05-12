import { describe, expect, it, vi } from "vitest";

vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");

import { addImageVersion, normalizePublicImageUrl, resolveSupabaseBucketImageUrl } from "./imageUrls";

describe("imageUrls", () => {
  it("normalizes relative Supabase storage paths into absolute URLs", () => {
    expect(normalizePublicImageUrl("/storage/v1/object/public/listing-images/demo/file.webp")).toBe(
      "https://example.supabase.co/storage/v1/object/public/listing-images/demo/file.webp",
    );
  });

  it("resolves bare bucket object paths to listing-images public URLs", () => {
    expect(resolveSupabaseBucketImageUrl("demo/file.webp", "listing-images")).toBe(
      "https://example.supabase.co/storage/v1/object/public/listing-images/demo/file.webp",
    );
  });

  it("keeps absolute external URLs unchanged", () => {
    expect(
      resolveSupabaseBucketImageUrl("https://cdn.example.com/image.webp", "listing-images"),
    ).toBe("https://cdn.example.com/image.webp");
  });

  it("does not append cache-busting query strings to app-local public assets", () => {
    expect(addImageVersion("/images/fallbacks/AlgarveOfficial-transportation.png", "2026-05-12")).toBe(
      "/images/fallbacks/AlgarveOfficial-transportation.png",
    );
  });

  it("blocks known broken public image hosts so listing cards can use fallbacks", () => {
    expect(
      normalizePublicImageUrl("https://lemonzest-foodcontent.com/wp-content/uploads/demo.png"),
    ).toBeNull();
    expect(
      normalizePublicImageUrl("https://www.pinecliffs.com/wp-content/uploads/2025/02/DJI_0067-scaled.jpg"),
    ).toBeNull();
  });
});
