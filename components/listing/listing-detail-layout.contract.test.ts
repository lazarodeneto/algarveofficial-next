import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();

describe("listing detail layout", () => {
  it("keeps listing content below the fixed public header", () => {
    const source = readFileSync(
      join(REPO_ROOT, "components", "listing", "ListingDetailClient.tsx"),
      "utf8",
    );

    expect(source).toContain('className="flex-1 pt-[4.5rem] pb-44 sm:pt-20 sm:pb-48 lg:pb-0"');
    expect(source).not.toContain('className="flex-1 pt-[10px] pb-44 sm:pb-48 lg:pb-0"');
  });
});
