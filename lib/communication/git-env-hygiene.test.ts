import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

function checkIgnoreExitCode(path: string) {
  try {
    execFileSync("git", ["check-ignore", "-q", path], {
      cwd: process.cwd(),
      stdio: "ignore",
    });
    return 0;
  } catch (error) {
    return typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: unknown }).status)
      : 1;
  }
}

describe("env file git hygiene", () => {
  it("allows .env.example to be tracked while keeping .env.local ignored", () => {
    expect(checkIgnoreExitCode(".env.example")).toBe(1);
    expect(checkIgnoreExitCode(".env.local")).toBe(0);
  });
});
