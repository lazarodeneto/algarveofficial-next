import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();

describe("listing business claim CTA visibility", () => {
  it("hides the claim CTA for verified and signature listings", () => {
    const source = readFileSync(
      join(REPO_ROOT, "components", "listing", "ListingDetailClient.tsx"),
      "utf8",
    );

    expect(source).toContain("const isSignatureOrVerifiedTier = listing.tier === \"signature\" || listing.tier === \"verified\"");
    expect(source).toContain("listing.status === \"published\" && !isExactBeachesListing && !isSignatureOrVerifiedTier");
    expect(source).toContain("<BusinessClaimCTA");
  });
});
