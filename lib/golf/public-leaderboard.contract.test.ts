import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();

describe("public golf leaderboard contract", () => {
  it("does not fall back to seeded mock leaderboard rows", () => {
    const source = readFileSync(join(REPO_ROOT, "lib", "golf", "index.ts"), "utf8");

    expect(source).not.toContain("MOCK_LEADERBOARD");
    expect(source).toContain("course_name");
    expect(source).toContain("return [] as GolfLeaderboardEntry[]");
  });

  it("renders the golf course name column in the shared leaderboard table", () => {
    const source = readFileSync(
      join(REPO_ROOT, "components", "golf", "LeaderboardTable.tsx"),
      "utf8",
    );

    expect(source).toContain('labels?.course ?? "Golf Course"');
    expect(source).toContain("entry.courseName ?? \"-\"");
  });
});
