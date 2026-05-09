import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH = join(
  process.cwd(),
  "supabase/migrations/20260509103000_add_listing_canonical_slug_management.sql",
);

function migrationSource() {
  return readFileSync(MIGRATION_PATH, "utf8");
}

describe("canonical listing slug management migration", () => {
  it("adds a locked RPC that returns old and new slugs", () => {
    const source = migrationSource();

    expect(source).toContain("function public.update_listing_canonical_slug");
    expect(source).toContain("for update");
    expect(source).toContain("returns table(old_slug text, new_slug text)");
  });

  it("enforces slug uniqueness and one current slug row per listing", () => {
    const source = migrationSource();

    expect(source).toContain("idx_listing_slugs_slug");
    expect(source).toContain("idx_listing_slugs_one_current_per_listing");
    expect(source).toContain("where is_current = true");
  });

  it("preserves old URLs as historical aliases before making a new current row", () => {
    const source = migrationSource();

    expect(source).toContain("values (p_listing_id, v_old_slug, false)");
    expect(source).toContain("set is_current = false");
    expect(source).toContain("values (p_listing_id, v_new_slug, true)");
  });
});
