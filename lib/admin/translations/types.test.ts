import { describe, expect, it } from "vitest";
import { HIGH_PRIORITY_CITIES } from "./types";

describe("translation dashboard priority cities", () => {
  it("uses AlgarveOfficial city names only", () => {
    expect(HIGH_PRIORITY_CITIES).toEqual(
      expect.arrayContaining([
        "Almancil",
        "Quinta do Lago",
        "Vale do Lobo",
        "Vilamoura",
        "Lagos",
        "Tavira",
        "Monchique",
      ]),
    );
    expect(HIGH_PRIORITY_CITIES).not.toEqual(
      expect.arrayContaining(["Lisbon", "Porto", "Cascais", "Sintra"]),
    );
  });
});
