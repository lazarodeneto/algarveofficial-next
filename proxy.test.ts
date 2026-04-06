import { describe, expect, it } from "vitest";

import { getUnlocalizedCanonicalPathFromRequestPath } from "./proxy";

describe("proxy unlocalized canonical path resolution", () => {
  it("keeps unlocalized-only auth and maintenance routes canonical", () => {
    expect(getUnlocalizedCanonicalPathFromRequestPath("/signup")).toBe("/signup");
    expect(getUnlocalizedCanonicalPathFromRequestPath("/forgot-password")).toBe("/forgot-password");
    expect(getUnlocalizedCanonicalPathFromRequestPath("/maintenance")).toBe("/maintenance");
  });

  it("normalizes trailing slash for unlocalized-only routes", () => {
    expect(getUnlocalizedCanonicalPathFromRequestPath("/signup/")).toBe("/signup");
    expect(getUnlocalizedCanonicalPathFromRequestPath("/fr/forgot-password/")).toBe("/forgot-password");
  });

  it("treats legacy real-estate detail routes as unlocalized canonicals", () => {
    expect(getUnlocalizedCanonicalPathFromRequestPath("/real-estate/premium-villa")).toBe(
      "/real-estate/premium-villa",
    );
    expect(getUnlocalizedCanonicalPathFromRequestPath("/pt-pt/real-estate/premium-villa")).toBe(
      "/real-estate/premium-villa",
    );
  });

  it("does not mark localized-first routes with localized counterparts as unlocalized", () => {
    expect(getUnlocalizedCanonicalPathFromRequestPath("/en/directory")).toBeNull();
    expect(getUnlocalizedCanonicalPathFromRequestPath("/fr/contact")).toBeNull();
    expect(getUnlocalizedCanonicalPathFromRequestPath("/real-estate")).toBeNull();
  });
});
