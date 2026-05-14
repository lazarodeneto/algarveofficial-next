import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const SOURCE = readFileSync(
  join(process.cwd(), "legacy-pages", "admin", "blog", "AdminBlog.tsx"),
  "utf8",
);

describe("AdminBlog row actions", () => {
  it("places the View/Edit/Delete menu beside the post title instead of a separate actions column", () => {
    expect(SOURCE).toContain("const renderPostActions = (post: BlogPostWithAuthor) => (");
    expect(SOURCE).toContain("aria-label={`Post actions for ${post.title}`}");
    expect(SOURCE).toContain("{renderPostActions(post)}");
    expect(SOURCE).not.toContain('key: "actions"');
    expect(SOURCE).toContain("View");
    expect(SOURCE).toContain("Edit");
    expect(SOURCE).toContain("Delete");
  });
});
