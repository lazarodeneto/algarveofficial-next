import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { proxy } from "../proxy";

const REPO_ROOT = process.cwd();

function source(path: string) {
  return readFileSync(join(REPO_ROOT, path), "utf8");
}

describe("claim business routing contract", () => {
  it("keeps claim business URLs out of legacy category/city proxy handling", () => {
    const proxy = source("proxy.ts");

    expect(proxy).toContain('"claim-business"');
    expect(proxy).toContain("resolveLegacyCategoryCityRequest");
    expect(source("app/[locale]/claim-business/[slug]/page.tsx")).toContain("getClaimListing");
    expect(source("app/claim-business/[slug]/page.tsx")).toContain(
      'redirectToPreferredLocalePath(`/claim-business/${slug}`)',
    );
  });

  it("does not return the proxy plain-text 404 for unprefixed claim slug URLs", async () => {
    const response = await proxy(
      new NextRequest("http://localhost/claim-business/palmyra-almancil"),
    );

    expect(response.status).not.toBe(404);
    expect(response.headers.get("x-middleware-rewrite")).toContain(
      "/en/claim-business/palmyra-almancil",
    );
  });

  it("does not return the proxy plain-text 404 for locale-prefixed claim slug URLs", async () => {
    const response = await proxy(
      new NextRequest("http://localhost/en/claim-business/palmyra-almancil"),
    );

    expect(response.status).not.toBe(404);
    expect(await response.text()).not.toBe("Not Found");
  });
});
