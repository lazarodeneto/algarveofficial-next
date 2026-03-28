import { describe, expect, it, vi } from "vitest";

vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");

import { normalizePublicImageUrl, resolveSupabaseBucketImageUrl } from "./imageUrls";

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
});
