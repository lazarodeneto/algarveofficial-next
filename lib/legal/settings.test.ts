import { describe, expect, it } from "vitest";

import {
  buildLegalSettingsCandidateIds,
  parseLegalSections,
  pickLegalSettingsRowByLocale,
} from "@/lib/legal/settings";

describe("legal settings locale fallback", () => {
  it("falls back to default for english locales", () => {
    expect(buildLegalSettingsCandidateIds("en")).toEqual(["default"]);
    expect(buildLegalSettingsCandidateIds("EN")).toEqual(["default"]);
  });

  it("prefers exact locale before default", () => {
    expect(buildLegalSettingsCandidateIds("fr")).toEqual(["fr", "default"]);
    expect(buildLegalSettingsCandidateIds("pt-pt")).toEqual(["pt-pt", "pt", "default"]);
  });

  it("picks the best matching row by locale", () => {
    const rows = [
      { id: "default", sections: [] },
      { id: "fr", sections: [] },
    ];
    expect(pickLegalSettingsRowByLocale(rows, "fr")?.id).toBe("fr");
    expect(pickLegalSettingsRowByLocale(rows, "de")?.id).toBe("default");
  });

  it("parses legal sections safely", () => {
    expect(parseLegalSections(null, "Shield")).toEqual([]);
    expect(
      parseLegalSections([{ id: "1", title: "Intro", content: "<p>Body</p>" }], "Shield"),
    ).toEqual([
      {
        id: "1",
        title: "Intro",
        icon: "Shield",
        content: "<p>Body</p>",
      },
    ]);
  });
});
