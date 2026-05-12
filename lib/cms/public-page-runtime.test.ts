import { describe, expect, it } from "vitest";

import {
  getNullableRuntimePageText,
  getRuntimePageConfig,
  getRuntimePageText,
  isRuntimeSectionEnabled,
} from "@/lib/cms/public-page-runtime";

describe("public page-builder runtime helpers", () => {
  it("falls back when no published CMS config exists", () => {
    const pageConfig = getRuntimePageConfig([], "beaches");

    expect(isRuntimeSectionEnabled(pageConfig, "hero", true)).toBe(true);
    expect(getRuntimePageText(pageConfig, "hero.title", "Default beaches title")).toBe(
      "Default beaches title",
    );
  });

  it("uses legacy text values for hero fields", () => {
    const pageConfig = {
      text: {
        "hero.imageUrl": "https://images.unsplash.com/photo-hero.jpg",
      },
    };

    expect(getRuntimePageText(pageConfig, "hero.imageUrl", "/images/default.jpg")).toBe(
      "https://images.unsplash.com/photo-hero.jpg",
    );
  });

  it("uses modern hero values for hero fields", () => {
    const pageConfig = {
      hero: {
        imageUrl: "https://images.unsplash.com/photo-modern-hero.jpg",
      },
    };

    expect(getRuntimePageText(pageConfig, "hero.imageUrl", "/images/default.jpg")).toBe(
      "https://images.unsplash.com/photo-modern-hero.jpg",
    );
  });

  it("treats empty hero text values as nullable so public pages can fall back safely", () => {
    const pageConfig = {
      text: {
        "hero.imageUrl": "",
      },
    };

    expect(getNullableRuntimePageText(pageConfig, "hero.imageUrl")).toBeNull();
    expect(getRuntimePageText(pageConfig, "hero.imageUrl", "/images/default.jpg")).toBe(
      "/images/default.jpg",
    );
  });

  it("respects explicit block hero disabled state", () => {
    const pageConfig = {
      blocks: {
        hero: {
          enabled: false,
        },
      },
    };

    expect(isRuntimeSectionEnabled(pageConfig, "hero", true)).toBe(false);
  });

  it("respects explicit modern hero disabled state", () => {
    const pageConfig = {
      hero: {
        enabled: false,
      },
    };

    expect(isRuntimeSectionEnabled(pageConfig, "hero", true)).toBe(false);
  });
});
