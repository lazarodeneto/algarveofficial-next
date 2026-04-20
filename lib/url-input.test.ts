import { describe, expect, it } from "vitest";

import {
  isValidExternalUrlInput,
  normalizeExternalUrlForStorage,
  normalizeExternalUrlInput,
} from "@/lib/url-input";

describe("url input helpers", () => {
  it("normalizes urls by adding https when missing", () => {
    expect(normalizeExternalUrlInput("example.com")).toBe("https://example.com");
    expect(normalizeExternalUrlInput("www.example.com/path")).toBe("https://www.example.com/path");
    expect(normalizeExternalUrlInput("https://example.com")).toBe("https://example.com");
  });

  it("validates and normalizes optional urls for storage", () => {
    expect(isValidExternalUrlInput("example.com")).toBe(true);
    expect(isValidExternalUrlInput("www.example.com")).toBe(true);
    expect(isValidExternalUrlInput("")).toBe(false);
    expect(normalizeExternalUrlForStorage("example.com")).toBe("https://example.com/");
    expect(normalizeExternalUrlForStorage("https://example.com/page")).toBe("https://example.com/page");
    expect(normalizeExternalUrlForStorage("not a url")).toBe(null);
  });
});
