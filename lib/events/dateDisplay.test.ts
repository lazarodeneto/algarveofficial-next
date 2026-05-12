import { describe, expect, it } from "vitest";

import { getEventDateBadgeParts } from "@/lib/events/dateDisplay";

describe("event date display", () => {
  it("shows a single month for ranges within the same month", () => {
    expect(
      getEventDateBadgeParts({
        start_date: "2026-07-03",
        end_date: "2026-07-05",
      }, "en"),
    ).toEqual({
      primary: "3 - 5",
      secondary: "Jul",
    });
  });

  it("shows both months for ranges crossing month boundaries", () => {
    expect(
      getEventDateBadgeParts({
        start_date: "2026-07-31",
        end_date: "2026-08-02",
      }, "pt-pt"),
    ).toEqual({
      primary: "31 - 2",
      secondary: "Jul / Ago",
    });
  });
});
