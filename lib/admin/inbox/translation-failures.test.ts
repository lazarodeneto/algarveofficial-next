import { describe, expect, it } from "vitest";

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
});
