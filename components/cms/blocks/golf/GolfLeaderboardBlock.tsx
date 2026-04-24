"use client";

import { LeaderboardTable } from "@/components/golf/LeaderboardTable";
import type { GolfLeaderboardEntry } from "@/lib/golf";

interface GolfLeaderboardBlockProps {
  settings: Record<string, unknown>;
  entries?: GolfLeaderboardEntry[];
}

export function GolfLeaderboardBlock({ settings, entries = [] }: GolfLeaderboardBlockProps) {
  if (entries.length === 0) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="app-container">
          <h2 className="font-serif text-3xl md:text-4xl mb-6">Golf Leaderboard</h2>
          <p className="text-muted-foreground">No leaderboard data available.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-muted/30">
      <div className="app-container">
        <LeaderboardTable entries={entries} />
      </div>
    </section>
  );
}