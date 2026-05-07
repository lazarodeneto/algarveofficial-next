import { describe, expect, it } from "vitest";

import { formatInboxSlaRelative } from "./format";

describe("formatInboxSlaRelative", () => {
  it("keeps short durations in minutes", () => {
    expect(formatInboxSlaRelative(27)).toBe("27m left");
    expect(formatInboxSlaRelative(-27)).toBe("27m overdue");
  });

  it("uses hours for longer same-day durations", () => {
    expect(formatInboxSlaRelative(181)).toBe("3h left");
    expect(formatInboxSlaRelative(-181)).toBe("3h overdue");
  });

  it("uses days for multi-day durations", () => {
    expect(formatInboxSlaRelative(2_880)).toBe("2d left");
    expect(formatInboxSlaRelative(-25_174)).toBe("17d overdue");
  });
});
