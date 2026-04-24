import type { GolfLeaderboardEntry } from "@/lib/golf";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LeaderboardTableProps {
  entries: GolfLeaderboardEntry[];
}

function formatScore(score: number) {
  if (score > 0) return `+${score}`;
  if (score === 0) return "E";
  return String(score);
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">Rank</TableHead>
          <TableHead>Player</TableHead>
          <TableHead className="w-28 text-right">Score</TableHead>
          <TableHead className="w-28 text-right">Rounds</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={`${entry.rank}-${entry.player}`}>
            <TableCell className="font-semibold">#{entry.rank}</TableCell>
            <TableCell>{entry.player}</TableCell>
            <TableCell className="text-right font-semibold">{formatScore(entry.score)}</TableCell>
            <TableCell className="text-right">{entry.rounds ?? "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
