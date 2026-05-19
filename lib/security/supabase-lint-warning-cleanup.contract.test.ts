import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();
const MIGRATION_PATH = join(
  REPO_ROOT,
  "supabase/migrations/20260518230000_clear_supabase_lint_warnings.sql",
);

function migrationSource() {
  return readFileSync(MIGRATION_PATH, "utf8");
}

describe("Supabase lint warning cleanup migration", () => {
  it("pins search_path for the functions reported by the Supabase linter", () => {
    const source = migrationSource();

    for (const functionName of [
      "update_listing_seo",
      "hash_en_translation",
      "handle_new_user",
      "set_featured_ranks",
      "set_ctx_positions",
      "mark_blog_post_translations_needs_review",
      "set_golf_updated_at",
      "pin_listing_to_context",
      "unpin_listing_from_context",
      "cleanup_expired_featured_positions",
      "validate_slot_price",
      "normalize_listing_slug_input",
    ]) {
      expect(source).toContain(`'${functionName}'`);
    }

    expect(source).toContain("ALTER FUNCTION %s SET search_path = public, pg_temp");
  });

  it("replaces always-true analytics insert policies with bounded checks", () => {
    const source = migrationSource();

    expect(source).toContain('DROP POLICY IF EXISTS "analytics_events_anon_insert"');
    expect(source).toContain('DROP POLICY IF EXISTS "analytics_events_auth_insert"');
    expect(source).toContain("user_id IS NULL");
    expect(source).toContain("user_id = auth.uid()");
    expect(source).toContain("char_length(event_type) BETWEEN 1 AND 80");
    expect(source).not.toContain("WITH CHECK (true)");
  });

  it("removes broad public storage object listing policies", () => {
    const source = migrationSource();

    expect(source).toContain('DROP POLICY IF EXISTS "Public Access" ON storage.objects;');
    expect(source).toContain('DROP POLICY IF EXISTS "Anyone can view listing images" ON storage.objects;');
    expect(source).toContain('DROP POLICY IF EXISTS "Public can read media" ON storage.objects;');
  });

  it("keeps app-used RPCs authenticated while removing anonymous direct access", () => {
    const source = migrationSource();

    for (const functionName of [
      "admin_owner_crm_summaries",
      "approve_claim_and_assign_listing",
      "get_user_role",
      "mark_thread_messages_read",
      "update_listing_canonical_slug",
    ]) {
      expect(source).toContain(`'${functionName}'`);
    }

    expect(source).toContain("REVOKE EXECUTE ON FUNCTION %s FROM anon");
    expect(source).toContain("GRANT EXECUTE ON FUNCTION %s TO authenticated");
  });

  it("restricts internal trigger and cleanup functions to service role direct execution", () => {
    const source = migrationSource();

    for (const functionName of [
      "debug_current_user_access",
      "cleanup_old_rate_limits",
      "sync_subscriber_to_contacts",
      "track_listing_slug_change",
      "trigger_refresh_segment_counts",
    ]) {
      expect(source).toContain(`'${functionName}'`);
    }

    expect(source).toContain("REVOKE EXECUTE ON FUNCTION %s FROM authenticated");
    expect(source).toContain("GRANT EXECUTE ON FUNCTION %s TO service_role");
  });
});
