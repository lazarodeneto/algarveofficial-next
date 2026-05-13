import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();

describe("event map compact preview", () => {
  it("uses a bottom-docked compact preview so the map remains visible", () => {
    const source = readFileSync(join(REPO_ROOT, "components", "events", "EventMapDirectory.tsx"), "utf8");

    expect(source).toContain("absolute inset-x-3 bottom-3");
    expect(source).toContain("max-w-[25rem]");
    expect(source).toContain("grid grid-cols-[6rem_1fr]");
    expect(source).toContain("h-28 overflow-hidden");
    expect(source).toContain("h-8 items-center");
    expect(source).toContain("paddingBottomRight: [32, 148]");
    expect(source).not.toContain("absolute inset-x-5 top-5");
    expect(source).not.toContain("relative aspect-[16/9]");
  });
});
