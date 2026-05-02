import { describe, expect, it } from "vitest";

import { aggregateLeaderboardRows } from "@/lib/golf/leaderboard";

describe("aggregateLeaderboardRows", () => {
  it("groups by player name, keeps best score, and totals rounds", () => {
    const result = aggregateLeaderboardRows([
      { player_name: "Ana", to_par: 2, rounds_played: 1 },
      { player_name: "Ana", to_par: -1, rounds_played: 2 },
      { player_name: "Ben", to_par: 0, rounds_played: 3 },
    ]);

    expect(result).toEqual([
      { rank: 1, playerName: "Ana", score: -1, rounds: 3 },
      { rank: 2, playerName: "Ben", score: 0, rounds: 3 },
    ]);
  });

  it("sorts equal scores by rounds played descending and limits to top five", () => {
    const result = aggregateLeaderboardRows([
      { player_name: "One", to_par: 1, rounds_played: 1 },
      { player_name: "Two", to_par: 1, rounds_played: 4 },
      { player_name: "Three", to_par: 2, rounds_played: 1 },
      { player_name: "Four", to_par: 3, rounds_played: 1 },
      { player_name: "Five", to_par: 4, rounds_played: 1 },
      { player_name: "Six", to_par: 5, rounds_played: 1 },
    ]);

    expect(result.map((entry) => entry.playerName)).toEqual(["Two", "One", "Three", "Four", "Five"]);
  });
});
