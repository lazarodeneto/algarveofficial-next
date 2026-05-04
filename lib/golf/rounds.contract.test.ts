import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();

describe("golf round scorecard architecture", () => {
  it("keeps scorecard storage and hole-by-hole round routes in place", () => {
    const roundsSource = readFileSync(join(REPO_ROOT, "lib", "golf", "rounds.ts"), "utf8");
    const createRoundRoute = readFileSync(
      join(REPO_ROOT, "app", "api", "golf", "rounds", "route.ts"),
      "utf8",
    );
    const holeScoreRoute = readFileSync(
      join(
        REPO_ROOT,
        "app",
        "api",
        "golf",
        "rounds",
        "[roundId]",
        "holes",
        "[holeNumber]",
        "route.ts",
      ),
      "utf8",
    );

    expect(roundsSource).toContain(".from(\"golf_rounds\")");
    expect(roundsSource).toContain(".from(\"golf_round_holes\")");
    expect(roundsSource).toContain(".from(\"golf_holes\")");
    expect(createRoundRoute).toContain("createRoundForSession");
    expect(holeScoreRoute).toContain("updateHoleScore");
  });

  it("allows configured courses up to 36 holes when saving hole scores", () => {
    const roundsSource = readFileSync(join(REPO_ROOT, "lib", "golf", "rounds.ts"), "utf8");

    expect(roundsSource).toContain("input.holeNumber > 36");
    expect(roundsSource).not.toContain("input.holeNumber > 18");
  });
});
