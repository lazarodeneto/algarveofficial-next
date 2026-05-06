import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();
const MIGRATION_PATH = join(
  REPO_ROOT,
  "supabase/migrations/20260506151000_sync_newsletter_updates_to_email_contacts.sql",
);

function migrationSource() {
  return readFileSync(MIGRATION_PATH, "utf8");
}

describe("newsletter subscriber to email contact sync migration", () => {
  it("syncs subscriber inserts and updates into email_contacts", () => {
    const source = migrationSource();

    expect(source).toContain("CREATE OR REPLACE FUNCTION public.sync_subscriber_to_contacts()");
    expect(source).toContain("ON CONFLICT (email) DO UPDATE SET");
    expect(source).toMatch(/AFTER\s+INSERT\s+OR\s+UPDATE\s+OF\s+email,\s+full_name,\s+is_subscribed,\s+subscribed_at,\s+source,\s+tags/s);
  });

  it("normalizes emails and preserves consent when unsubscribing", () => {
    const source = migrationSource();

    expect(source).toContain("lower(trim(NEW.email))");
    expect(source).toContain("WHEN NEW.is_subscribed THEN 'subscribed'::public.email_contact_status");
    expect(source).toContain("ELSE 'unsubscribed'::public.email_contact_status");
    expect(source).toContain("ELSE public.email_contacts.consent_given_at");
  });
});
