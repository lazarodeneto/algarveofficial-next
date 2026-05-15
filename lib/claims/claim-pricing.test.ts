import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("claim pricing contract", () => {
  it("keeps paid claim checkout options monthly-only", () => {
    const source = readFileSync("lib/claims/claim-pricing.ts", "utf8");
    const candidatesBlock = source.match(/const candidates = \[[\s\S]*?\];/)?.[0] ?? "";

    expect(candidatesBlock).toContain("tierSnapshot.currentMonthly");
    expect(candidatesBlock).toContain("tierSnapshot.monthly");
    expect(candidatesBlock).not.toContain("tierSnapshot.currentYearly");
    expect(candidatesBlock).not.toContain("tierSnapshot.yearly");
    expect(candidatesBlock).not.toContain("tierSnapshot.promo");
  });
});
