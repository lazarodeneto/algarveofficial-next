import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const SOURCE = readFileSync(
  join(process.cwd(), "legacy-pages", "admin", "AdminListings.tsx"),
  "utf8",
);

describe("AdminListings row actions", () => {
  it("places the listing image and actions menu beside the listing title", () => {
    const imageBinding = 'src={listing.featured_image_url || "/placeholder.svg"}';

    expect(SOURCE).toContain("const renderListingActions = (listing: any) => (");
    expect(SOURCE).toContain("aria-label={`Listing actions for ${listing.name}`}");
    expect(SOURCE.split(imageBinding)).toHaveLength(3);
    expect(SOURCE).toContain("{renderListingActions(listing)}");
    expect(SOURCE).not.toContain('key: "actions"');
    expect(SOURCE).toContain("Edit");
  });
});
