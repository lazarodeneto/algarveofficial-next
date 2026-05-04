import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import {
  completeRound,
  getRoundWithData,
  GolfRoundsError,
} from "@/lib/golf/rounds";
import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/routing";
import { getServerTranslations } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import ScorecardSummary from "@/components/golf/ScorecardSummary";
import ScorecardTable from "@/components/golf/ScorecardTable";
import { STANDARD_PUBLIC_CONTENT_TOP_CLASS } from "@/components/sections/hero-layout";

interface PageProps {
  params: Promise<{ locale: string; roundId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, roundId } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  return buildLocalizedMetadata({
    locale,
    path: `/golf/round/${roundId}/scorecard`,
    title: "Golf Scorecard",
    description:
      "Review front nine, back nine, and round totals with versus-par summary.",
    keywords: ["golf scorecard", "round summary", "Algarve golf"],
  });
}

export default async function GolfRoundScorecardPage({ params }: PageProps) {
  const { locale: rawLocale, roundId } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  const authClient = await createClient();
  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser();

  if (userError || !user) {
    const requestedPath = buildLocalizedPath(locale, `/golf/round/${roundId}/scorecard`);
    redirect(buildLocalizedPath(locale, `/login?next=${encodeURIComponent(requestedPath)}`));
  }

  let roundData;
  try {
    roundData = await getRoundWithData({ roundId, userId: user.id });
  } catch (error) {
    if (error instanceof GolfRoundsError && error.code === "INVALID_INPUT") {
      notFound();
    }
    throw error;
  }

  if (!roundData) notFound();
  const { round, holes, scores } = roundData;
  const holeGroups = Array.from({ length: Math.ceil(holes.length / 9) }, (_, index) =>
    holes.slice(index * 9, index * 9 + 9),
  ).filter((group) => group.length > 0);
  const translations = await getServerTranslations(locale, [
    "golf.scorecard.back",
    "golf.scorecard.title",
    "golf.scorecard.roundFinished",
    "golf.scorecard.finishRound",
    "golf.scorecard.frontNine",
    "golf.scorecard.backNine",
    "golf.scorecard.holesRange",
    "golf.scorecard.diff",
    "golf.scorecard.total",
    "golfCourse.hole",
    "golfCourse.par",
    "golfCourse.score",
  ]);

  async function finishRoundAction() {
    "use server";

    const actionClient = await createClient();
    const {
      data: { user: actionUser },
      error: actionUserError,
    } = await actionClient.auth.getUser();

    if (actionUserError || !actionUser) {
      const requestedPath = buildLocalizedPath(locale, `/golf/round/${roundId}/scorecard`);
      redirect(buildLocalizedPath(locale, `/login?next=${encodeURIComponent(requestedPath)}`));
    }

    await completeRound({ roundId, userId: actionUser.id });
    redirect(buildLocalizedPath(locale, `/golf/round/${roundId}/scorecard`));
  }

  return (
    <main className={`app-container overflow-x-hidden pb-10 ${STANDARD_PUBLIC_CONTENT_TOP_CLASS}`}>
      <section className="mx-auto w-full max-w-3xl space-y-4 sm:space-y-5">
        <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3">
          <Button asChild variant="outline" size="sm">
            <Link
              href={buildLocalizedPath(locale, `/golf/round/${roundId}`)}
              className="min-h-11 px-3 text-xs sm:px-4 sm:text-sm"
            >
              {translations["golf.scorecard.back"] ?? "Back"}
            </Link>
          </Button>
          <h1 className="min-w-0 truncate text-center font-serif text-2xl text-foreground sm:text-3xl">
            {translations["golf.scorecard.title"] ?? "Scorecard"}
          </h1>
          <form action={finishRoundAction}>
            <Button
              variant="gold"
              size="sm"
              disabled={Boolean(round.finishedAt)}
              className="min-h-11 px-3 text-xs sm:px-4 sm:text-sm"
            >
              {round.finishedAt
                ? translations["golf.scorecard.roundFinished"] ?? "Round Finished"
                : translations["golf.scorecard.finishRound"] ?? "Finish Round"}
            </Button>
          </form>
        </header>

        {holeGroups.map((group, index) => {
          const firstHole = group[0]?.holeNumber ?? index * 9 + 1;
          const lastHole = group[group.length - 1]?.holeNumber ?? firstHole;
          const title =
            index === 0
              ? translations["golf.scorecard.frontNine"] ?? "Front Nine"
              : index === 1
                ? translations["golf.scorecard.backNine"] ?? "Back Nine"
                : (translations["golf.scorecard.holesRange"] ?? "Holes {{start}}-{{end}}")
                    .replace("{{start}}", String(firstHole))
                    .replace("{{end}}", String(lastHole));

          return (
            <ScorecardTable
              key={`${firstHole}-${lastHole}`}
              title={title}
              holes={group}
              scores={scores}
              labels={{
                hole: translations["golfCourse.hole"],
                par: translations["golfCourse.par"],
                score: translations["golfCourse.score"],
              }}
            />
          );
        })}
        <ScorecardSummary
          holes={holes}
          scores={scores}
          labels={{
            frontNine: translations["golf.scorecard.frontNine"],
            backNine: translations["golf.scorecard.backNine"],
            holesRange: translations["golf.scorecard.holesRange"],
            diff: translations["golf.scorecard.diff"],
            total: translations["golf.scorecard.total"],
          }}
        />
      </section>
    </main>
  );
}
