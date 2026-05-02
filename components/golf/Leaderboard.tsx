import { getLeaderboard } from "@/lib/golf/leaderboard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LeaderboardLabels {
  title: string;
  rank: string;
  player: string;
  score: string;
  rounds: string;
}

interface LeaderboardProps {
  courseId: string;
  labels: LeaderboardLabels;
}

function formatScore(score: number) {
  if (score > 0) return `+${score}`;
  if (score === 0) return "E";
  return String(score);
}

export async function Leaderboard({ courseId, labels }: LeaderboardProps) {
  const entries = await getLeaderboard(courseId);
  if (entries.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl py-12">
      <div className="overflow-hidden rounded-2xl border border-border/70 shadow-sm">
        <div className="border-b border-border/70 px-4 py-3">
          <h2 className="font-serif text-2xl font-medium text-foreground">{labels.title}</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">{labels.rank}</TableHead>
              <TableHead>{labels.player}</TableHead>
              <TableHead className="w-28 text-right">{labels.score}</TableHead>
              <TableHead className="w-28 text-right">{labels.rounds}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={`${entry.rank}-${entry.playerName}`}>
                <TableCell className="font-semibold">#{entry.rank}</TableCell>
                <TableCell>{entry.playerName}</TableCell>
                <TableCell className="text-right font-semibold">{formatScore(entry.score)}</TableCell>
                <TableCell className="text-right">{entry.rounds}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
