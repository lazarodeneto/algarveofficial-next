import type { Metadata } from "next";

import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/config";
import { getLeaderboard } from "@/lib/golf";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import { LeaderboardTable } from "@/components/golf/LeaderboardTable";
import { STANDARD_PUBLIC_CONTENT_TOP_CLASS } from "@/components/sections/hero-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  return buildLocalizedMetadata({
    locale,
    path: "/golf/leaderboard",
    title: "Golf Leaderboard",
    description: "Follow player rankings and scores across Algarve golf events.",
    keywords: ["Golf leaderboard", "Algarve golf ranking", "Golf scores"],
  });
}

export default async function GolfLeaderboardPage() {
  const entries = await getLeaderboard();

  return (
    <main className={`app-container space-y-6 pb-10 ${STANDARD_PUBLIC_CONTENT_TOP_CLASS}`}>
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Leaderboard</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Current player standings and score differentials.
        </p>
      </section>

      <Card className="min-h-[300px]">
        <CardHeader>
          <CardTitle>Top Players</CardTitle>
          <CardDescription>Scores are shown relative to par.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <LeaderboardTable entries={entries} />
        </CardContent>
      </Card>
    </main>
  );
}
