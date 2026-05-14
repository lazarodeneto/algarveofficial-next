import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { isProcessorUnconfiguredTranslationError } from "./translation-failures";

describe("admin inbox translation failure grouping", () => {
  it("recognizes expected unconfigured processor failures for grouping", () => {
    expect(
      isProcessorUnconfiguredTranslationError(
        "Translation processor is not configured. Job was not marked complete.",
      ),
    ).toBe(true);
  });

  it("does not group unrelated translation failures as configuration warnings", () => {
    expect(isProcessorUnconfiguredTranslationError("Provider quota exceeded")).toBe(false);
    expect(isProcessorUnconfiguredTranslationError(null)).toBe(false);
  });

  it("keeps grouped translation alerts tied to a real job row id for inbox actions", () => {
    const source = readFileSync(join(process.cwd(), "lib/admin/inbox/aggregator.ts"), "utf8");

    expect(source).toContain('id: "translation:processor-unconfigured"');
    expect(source).toContain("sourceRowId: representative.id");
    expect(source).not.toContain('sourceRowId: "processor-unconfigured"');
  });
});
