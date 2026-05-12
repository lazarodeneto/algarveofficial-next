import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Scorecard } from "./Scorecard";

const labels = {
  title: "Scorecard",
  hole: "Hole",
  par: "Par",
  hcp: "HDCP",
  white: "White",
  yellow: "Yellow",
  red: "Red",
};

const pestanaAltoRows = [
  { holeNumber: 1, white: 151, yellow: 140, red: 128, par: 3, hcp: 16 },
  { holeNumber: 2, white: 347, yellow: 340, red: 225, par: 4, hcp: 12 },
  { holeNumber: 3, white: 393, yellow: 430, red: 327, par: 4, hcp: 2 },
  { holeNumber: 4, white: 378, yellow: 341, red: 298, par: 4, hcp: 6 },
  { holeNumber: 5, white: 419, yellow: 409, red: 349, par: 5, hcp: 18 },
  { holeNumber: 6, white: 378, yellow: 366, red: 335, par: 4, hcp: 4 },
  { holeNumber: 7, white: 187, yellow: 180, red: 166, par: 3, hcp: 8 },
  { holeNumber: 8, white: 304, yellow: 293, red: 268, par: 4, hcp: 14 },
  { holeNumber: 9, white: 352, yellow: 336, red: 325, par: 4, hcp: 10 },
  { holeNumber: 10, white: 390, yellow: 341, red: 314, par: 4, hcp: 5 },
  { holeNumber: 11, white: 130, yellow: 117, red: 104, par: 3, hcp: 17 },
  { holeNumber: 12, white: 123, yellow: 112, red: 91, par: 3, hcp: 15 },
  { holeNumber: 13, white: 413, yellow: 382, red: 354, par: 4, hcp: 3 },
  { holeNumber: 14, white: 242, yellow: 230, red: 208, par: 4, hcp: 13 },
  { holeNumber: 15, white: 347, yellow: 340, red: 320, par: 4, hcp: 9 },
  { holeNumber: 16, white: 604, yellow: 591, red: 523, par: 5, hcp: 1 },
  { holeNumber: 17, white: 147, yellow: 129, red: 112, par: 3, hcp: 11 },
  { holeNumber: 18, white: 507, yellow: 504, red: 402, par: 5, hcp: 7 },
];

describe("Scorecard", () => {
  it("renders tee columns before par and handicap with Out/In/Total rows", () => {
    render(<Scorecard rows={pestanaAltoRows} labels={labels} />);

    const headerCells = screen.getAllByRole("columnheader").map((cell) => cell.textContent);
    expect(headerCells).toEqual(["Hole", "White", "Yellow", "Red", "Par", "HDCP"]);

    expect(screen.getByRole("row", { name: "Out 2,909 2,835 2,421 35" })).toBeInTheDocument();
    expect(screen.getByRole("row", { name: "In 2,903 2,746 2,428 35" })).toBeInTheDocument();
    expect(screen.getByRole("row", { name: "Total 5,812 5,581 4,849 70" })).toBeInTheDocument();
  });
});
