import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();

describe("golf scorecard responsive layout contracts", () => {
  it("keeps the hole-by-hole scoring controls fluid on narrow mobile screens", () => {
    const source = readFileSync(
      join(REPO_ROOT, "components", "golf", "GolfRoundScoringClient.tsx"),
      "utf8",
    );

    expect(source).toContain("grid-cols-[auto_minmax(0,1fr)_auto]");
    expect(source).toContain("grid-cols-[minmax(64px,82px)_minmax(0,1fr)_minmax(64px,82px)]");
    expect(source).toContain("h-[clamp(4rem,22vw,5.125rem)]");
    expect(source).toContain("truncate");
    expect(source).not.toContain("grid-cols-[90px_1fr_90px]");
    expect(source).not.toContain("h-[82px] w-[82px]");
  });

  it("does not force the round scorecard table wider than mobile viewports", () => {
    const tableSource = readFileSync(
      join(REPO_ROOT, "components", "golf", "ScorecardTable.tsx"),
      "utf8",
    );
    const pageSource = readFileSync(
      join(
        REPO_ROOT,
        "app",
        "[locale]",
        "golf",
        "round",
        "[roundId]",
        "scorecard",
        "page.tsx",
      ),
      "utf8",
    );

    expect(tableSource).toContain("gridTemplateColumns");
    expect(tableSource).toContain("w-full max-w-full overflow-hidden");
    expect(tableSource).not.toContain("min-w-[620px]");
    expect(pageSource).toContain("grid-cols-[auto_minmax(0,1fr)_auto]");
  });
});
