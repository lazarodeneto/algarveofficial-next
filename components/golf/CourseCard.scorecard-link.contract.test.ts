import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();

describe("golf course card scorecard link", () => {
  it("shows a scorecard link only for courses with scorecard rows", () => {
    const source = readFileSync(join(REPO_ROOT, "components", "golf", "CourseCard.tsx"), "utf8");

    expect(source).toContain("course.scorecardHoles.length > 0");
    expect(source).toContain("const scorecardHref = `${courseHref}#scorecard`");
    expect(source).toContain("labels.scorecard");
    expect(source).toContain("ClipboardList");
  });

  it("uses the shared listing favorite control", () => {
    const source = readFileSync(join(REPO_ROOT, "components", "golf", "CourseCard.tsx"), "utf8");

    expect(source).toContain('"use client"');
    expect(source).toContain("useFavoriteListings");
    expect(source).toContain("FavoriteButton");
    expect(source).toContain('variant="glassmorphism"');
    expect(source).toContain('size="sm"');
  });

  it("anchors the detail page scorecard section", () => {
    const source = readFileSync(join(REPO_ROOT, "components", "golf", "Scorecard.tsx"), "utf8");

    expect(source).toContain('id="scorecard"');
    expect(source).toContain("scroll-mt-28");
  });
});
