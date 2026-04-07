import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = process.cwd();
const CMS_DOCUMENTS_ROUTE = join(
  REPO_ROOT,
  "app",
  "api",
  "admin",
  "cms",
  "documents",
  "route.ts",
);

describe("admin read-route contract", () => {
  it("uses read auth helper for cms documents endpoint", () => {
    const source = readFileSync(CMS_DOCUMENTS_ROUTE, "utf8");
    expect(source).toContain("requireAdminReadClient");
    expect(source).not.toContain("requireAdminWriteClient");
  });
});
