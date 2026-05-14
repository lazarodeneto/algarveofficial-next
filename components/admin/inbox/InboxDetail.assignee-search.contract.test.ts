import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SOURCE_PATH = join(process.cwd(), "components/admin/inbox/InboxDetail.tsx");

describe("InboxDetail assignee search", () => {
  it("uses searchable admin assignees instead of raw UUID entry", () => {
    const source = readFileSync(SOURCE_PATH, "utf8");

    expect(source).toContain("/api/admin/inbox/assignees");
    expect(source).toContain("Search by name or email");
    expect(source).toContain("Assign to admin");
    expect(source).not.toContain("UUID of assignee");
    expect(source).not.toContain("Assign to user ID");
  });
});
