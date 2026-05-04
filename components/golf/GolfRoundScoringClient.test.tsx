import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GolfRoundScoringClient } from "./GolfRoundScoringClient";
import ScorecardSummary from "./ScorecardSummary";
import type { GolfRound } from "@/lib/golf/round-shared";

const labels = {
  back: "Back",
  scorecard: "Scorecard",
  holesEntered: "{{entered}} of {{total}} holes entered",
  noHoleData: "No hole data is available for this round.",
  white: "White",
  yellow: "Yellow",
  red: "Red",
  hole: "Hole",
  par: "Par",
  yards: "Yards",
  metres: "Metres",
  strokeIndex: "S.I.",
  strokes: "Strokes",
  decreaseStrokes: "Decrease strokes",
  increaseStrokes: "Increase strokes",
  saveFailed: "Save failed",
  saving: "Saving...",
  saved: "Saved",
  previousHole: "Previous hole",
  nextHole: "Next Hole {{hole}}",
  openScorecard: "Open Scorecard",
  unableToSaveScore: "Unable to save score.",
  unableToUpdateTee: "Unable to update tee color.",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

function buildRound(holeCount: number): GolfRound {
  return {
    id: "round-1",
    userId: "user-1",
    listingId: "listing-1",
    teeColor: "yellow",
    totalScore: null,
    totalVsPar: null,
    enteredHoles: 0,
    startedAt: "2026-05-04T08:00:00.000Z",
    finishedAt: null,
    course: {
      id: "listing-1",
      slug: "the-els-club-vilamoura",
      name: "The Els Club Vilamoura",
    },
    holes: Array.from({ length: holeCount }, (_, index) => ({
      holeNumber: index + 1,
      par: index % 3 === 0 ? 5 : index % 3 === 1 ? 4 : 3,
      strokeIndex: index + 1,
      distanceWhite: 400 + index,
      distanceYellow: 360 + index,
      distanceRed: 310 + index,
      strokes: null,
    })),
  };
}

describe("GolfRoundScoringClient", () => {
  it("renders a non-18-hole round and saves hole-by-hole strokes", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<GolfRoundScoringClient initialRound={buildRound(27)} locale="en" labels={labels} />);

    expect(screen.getByText("0 of 27 holes entered")).toBeInTheDocument();
    expect(screen.getByText("Hole 1 / 27")).toBeInTheDocument();
    expect(screen.getByText("Strokes")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Increase strokes" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/golf/rounds/round-1/holes/1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ strokes: 6 }),
        }),
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "Next Hole 2" }));
    expect(screen.getByText("Hole 2 / 27")).toBeInTheDocument();
  });
});

describe("ScorecardSummary", () => {
  it("keeps totals for courses beyond 18 holes", () => {
    const round = buildRound(27);

    render(
      <ScorecardSummary
        holes={round.holes}
        scores={{ 1: 6, 19: 4 }}
        labels={{
          frontNine: "Front Nine",
          backNine: "Back Nine",
          holesRange: "Holes {{start}}-{{end}}",
          diff: "Diff",
          total: "Total",
        }}
      />,
    );

    expect(screen.getByText("Front Nine")).toBeInTheDocument();
    expect(screen.getByText("Back Nine")).toBeInTheDocument();
    expect(screen.getByText("Holes 19-27")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
  });
});
