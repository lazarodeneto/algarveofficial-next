import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();

describe("golf tee-time request form removal", () => {
  it("does not render the old public tee-time request form on golf course pages", () => {
    const pageSource = readFileSync(
      join(REPO_ROOT, "app", "[locale]", "golf", "courses", "[slug]", "page.tsx"),
      "utf8",
    );

    expect(pageSource).not.toContain("RequestTeeTimeForm");
    expect(pageSource).not.toContain("golfCourse.teeTime");
    expect(pageSource).not.toContain("Request a tee time");
    expect(pageSource).not.toContain("Request Tee Time");
    expect(pageSource).not.toContain("Preferred date");
    expect(pageSource).not.toContain("Preferred time");
    expect(pageSource).not.toContain("Number of players");
    expect(pageSource).not.toContain("Handicap / playing level");
  });

  it("keeps the scorecard round entry point separate from tee-time booking", () => {
    const pageSource = readFileSync(
      join(REPO_ROOT, "app", "[locale]", "golf", "courses", "[slug]", "page.tsx"),
      "utf8",
    );

    expect(pageSource).toContain("StartRoundButton");
    expect(pageSource).toContain("course.scorecardHoles");
    expect(pageSource).toContain("bookingUrl={details?.bookingUrl}");
  });

  it("removes the obsolete public tee-time request endpoint and component", () => {
    expect(existsSync(join(REPO_ROOT, "components", "golf", "RequestTeeTimeForm.tsx"))).toBe(false);
    expect(existsSync(join(REPO_ROOT, "app", "api", "golf", "tee-time-request", "route.ts"))).toBe(false);
  });
});
