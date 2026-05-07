import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();
const MIGRATION_PATH = join(
  REPO_ROOT,
  "supabase/migrations/20260507103000_add_canonical_slug_format_constraints.sql",
);

function migrationSource() {
  return readFileSync(MIGRATION_PATH, "utf8");
}

describe("canonical slug format constraints migration", () => {
  it("adds future-enforcing canonical slug checks without validating existing data immediately", () => {
    const source = migrationSource();
    const executableSource = source
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n");

    expect(source).toContain("^[a-z0-9]+(-[a-z0-9]+)*$");
    expect(source).toContain("CHECK (%I IS NOT NULL AND %I ~ %L) NOT VALID");
    expect(executableSource).not.toMatch(/VALIDATE\s+CONSTRAINT/i);
  });

  it("covers every slug-bearing public table used by routes or admin content", () => {
    const source = migrationSource();

    for (const constraint of [
      "listings_slug_canonical_chk",
      "listing_slugs_slug_canonical_chk",
      "categories_slug_canonical_chk",
      "cities_slug_canonical_chk",
      "regions_slug_canonical_chk",
      "pages_slug_canonical_chk",
      "blog_posts_slug_canonical_chk",
      "events_slug_canonical_chk",
      "footer_sections_slug_canonical_chk",
      "tags_slug_canonical_chk",
    ]) {
      expect(source).toContain(constraint);
    }
  });

  it("does not add duplicate unique indexes where uniqueness already exists", () => {
    const source = migrationSource();

    expect(source).not.toMatch(/CREATE\s+UNIQUE\s+INDEX/i);
    expect(source).not.toMatch(/ALTER\s+TABLE[^;]+ADD\s+CONSTRAINT[^;]+UNIQUE/i);
  });
});
