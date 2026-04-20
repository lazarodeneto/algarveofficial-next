import { describe, expect, it } from "vitest";

import { resolvePostAuthRedirectPath } from "@/lib/authRedirect";

describe("resolvePostAuthRedirectPath", () => {
  it("returns the requested internal path when it is safe", () => {
    expect(
      resolvePostAuthRedirectPath("/en/dashboard/messages?thread=1", "en", "/dashboard"),
    ).toBe("/dashboard/messages?thread=1");
  });

  it("localizes relative internal paths that do not already carry a locale", () => {
    expect(resolvePostAuthRedirectPath("/dashboard", "fr", "/dashboard")).toBe("/fr/dashboard");
  });

  it("falls back for auth routes and external-looking paths", () => {
    expect(resolvePostAuthRedirectPath("/login", "en", "/dashboard")).toBe("/dashboard");
    expect(resolvePostAuthRedirectPath("//evil.test", "en", "/dashboard")).toBe("/dashboard");
    expect(resolvePostAuthRedirectPath("https://evil.test", "en", "/dashboard")).toBe(
      "/dashboard",
    );
  });
});
