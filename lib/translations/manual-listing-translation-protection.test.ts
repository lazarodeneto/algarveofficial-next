import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase", "migrations", "20260515133000_add_listing_translation_source_protection.sql"),
  "utf8",
);

describe("manual listing translation protection migration", () => {
  it("adds canonical translation_source provenance safely", () => {
    expect(migration).toContain("ADD COLUMN IF NOT EXISTS translation_source text");
    expect(migration).toContain("CHECK (translation_source IN ('manual', 'automatic'))");
    expect(migration).toContain("ALTER COLUMN translation_source SET NOT NULL");
    expect(migration).toContain("translation_status = 'edited'");
    expect(migration).toContain("SET translation_source = 'manual'");
  });

  it("keeps allow_manual_overwrite idempotent and non-null", () => {
    expect(migration).toContain("ADD COLUMN IF NOT EXISTS allow_manual_overwrite boolean");
    expect(migration).toContain("ALTER COLUMN allow_manual_overwrite SET DEFAULT false");
    expect(migration).toContain("ALTER COLUMN allow_manual_overwrite SET NOT NULL");
  });

  it("prevents source-change requeue of manual reviewed or edited rows", () => {
    expect(migration).toMatch(/CREATE OR REPLACE FUNCTION public\.listings_content_changed\(\)[\s\S]+lt\.translation_source = 'manual'[\s\S]+lt\.translation_status = 'edited'/);
    expect(migration).toMatch(/CREATE OR REPLACE FUNCTION public\.mark_listing_translations_needs_review\(\)[\s\S]+translation_source <> 'manual'/);
    expect(migration).toMatch(/CREATE OR REPLACE FUNCTION public\.queue_jobs_only_on_change\(\)[\s\S]+protected_manual/);
  });

  it("still permits automatic reviewed translations to be requeued", () => {
    expect(migration).toContain("tj.status IN ('auto', 'reviewed')");
    expect(migration).toContain("ELSE 'queued'::public.translation_status");
  });
});
