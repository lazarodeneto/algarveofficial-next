import { describe, expect, it } from "vitest";

import { canUseNextImage } from "@/lib/nextImageSafety";

describe("canUseNextImage", () => {
  it("allows listing image hosts that are configured for Next Image optimization", () => {
    expect(canUseNextImage("https://images.unsplash.com/photo-1")).toBe(true);
    expect(canUseNextImage("https://static.wixstatic.com/media/example.jpg")).toBe(true);
    expect(canUseNextImage("https://cdn.wixstatic.com/media/example.jpg")).toBe(true);
    expect(canUseNextImage("https://niylxpvafywjonrphddp.supabase.co/storage/v1/object/public/listings/example.webp")).toBe(true);
  });

  it("rejects unsupported non-https external hosts", () => {
    expect(canUseNextImage("http://example.com/image.jpg")).toBe(false);
  });
});
