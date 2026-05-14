import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH = join(
  process.cwd(),
  "supabase/migrations/20260512110500_resync_admin_inbox_side_table_sources.sql",
);
const TEXT_SOURCE_ROW_ID_MIGRATION_PATH = join(
  process.cwd(),
  "supabase/migrations/20260514112000_allow_text_admin_inbox_source_row_ids.sql",
);

const CURRENT_INBOX_SOURCES = [
  "billing_subscription",
  "external_outbox_alert",
  "listing_claim",
  "listing_moderation",
  "review_moderation",
  "event_moderation",
  "translation_job",
] as const;

function migrationSource() {
  return readFileSync(MIGRATION_PATH, "utf8");
}

describe("admin inbox side-table source constraints", () => {
  it("allows every current inbox source in archive and assignment side tables", () => {
    const source = migrationSource();

    expect(source).toContain("admin_inbox_archives_source_chk");
    expect(source).toContain("admin_inbox_assignments_source_chk");

    for (const inboxSource of CURRENT_INBOX_SOURCES) {
      expect(source).toContain(`'${inboxSource}'`);
    }
  });

  it("keeps translation jobs clearable through admin_inbox_archives", () => {
    const source = migrationSource();
    const archiveConstraintStart = source.indexOf("ADD CONSTRAINT admin_inbox_archives_source_chk");
    const assignmentConstraintStart = source.indexOf("ADD CONSTRAINT admin_inbox_assignments_source_chk");
    const archiveConstraint = source.slice(archiveConstraintStart, assignmentConstraintStart);

    expect(archiveConstraint).toContain("'translation_job'");
  });

  it("allows derived inbox items to use stable non-UUID source row keys", () => {
    const source = readFileSync(TEXT_SOURCE_ROW_ID_MIGRATION_PATH, "utf8");

    expect(source).toContain("ALTER COLUMN source_row_id TYPE text");
    expect(source).toContain("admin_inbox_archives_pkey");
    expect(source).toContain("admin_inbox_assignments_pkey");
  });
});
