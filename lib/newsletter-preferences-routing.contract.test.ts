import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { proxy } from "../proxy";

const REPO_ROOT = process.cwd();

function source(path: string) {
  return readFileSync(join(REPO_ROOT, path), "utf8");
}

describe("newsletter preferences routing contract", () => {
  it("keeps newsletter preference URLs out of legacy category/city proxy handling", () => {
    expect(source("proxy.ts")).toContain('"newsletter"');
    expect(source("app/newsletter/preferences/page.tsx")).toContain("NewsletterPreferencesForm");
    expect(source("app/[locale]/newsletter/preferences/page.tsx")).toContain("NewsletterPreferencesForm");
  });

  it("does not return the proxy plain-text 404 for unprefixed preference URLs", async () => {
    const response = await proxy(
      new NextRequest("http://localhost/newsletter/preferences?token=test-token"),
    );

    expect(response.status).not.toBe(404);
    expect(response.headers.get("x-middleware-rewrite")).toContain(
      "/en/newsletter/preferences",
    );
  });

  it("does not return the proxy plain-text 404 for locale-prefixed preference URLs", async () => {
    const response = await proxy(
      new NextRequest("http://localhost/pt-pt/newsletter/preferences?token=test-token"),
    );

    expect(response.status).not.toBe(404);
    expect(await response.text()).not.toBe("Not Found");
  });
});
