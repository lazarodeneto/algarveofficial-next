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
  const frontNine = holes.slice(0, 9);
  const backNine = holes.slice(9, 18);
  const translations = await getServerTranslations(locale, [
    "golf.scorecard.back",
    "golf.scorecard.title",
    "golf.scorecard.roundFinished",
    "golf.scorecard.finishRound",
    "golf.scorecard.frontNine",
    "golf.scorecard.backNine",
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
    <main className={`app-container pb-10 ${STANDARD_PUBLIC_CONTENT_TOP_CLASS}`}>
      <section className="mx-auto w-full max-w-3xl space-y-5">
        <header className="flex items-center justify-between gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href={buildLocalizedPath(locale, `/golf/round/${roundId}`)}>
              {translations["golf.scorecard.back"] ?? "Back"}
            </Link>
          </Button>
          <h1 className="truncate font-serif text-3xl text-foreground">
            {translations["golf.scorecard.title"] ?? "Scorecard"}
          </h1>
          <form action={finishRoundAction}>
            <Button variant="gold" size="sm" disabled={Boolean(round.finishedAt)}>
              {round.finishedAt
                ? translations["golf.scorecard.roundFinished"] ?? "Round Finished"
                : translations["golf.scorecard.finishRound"] ?? "Finish Round"}
            </Button>
          </form>
        </header>

        <ScorecardTable
          title={translations["golf.scorecard.frontNine"] ?? "Front Nine"}
          holes={frontNine}
          scores={scores}
          labels={{
            hole: translations["golfCourse.hole"],
            par: translations["golfCourse.par"],
            score: translations["golfCourse.score"],
          }}
        />
        <ScorecardTable
          title={translations["golf.scorecard.backNine"] ?? "Back Nine"}
          holes={backNine}
          scores={scores}
          labels={{
            hole: translations["golfCourse.hole"],
            par: translations["golfCourse.par"],
            score: translations["golfCourse.score"],
          }}
        />
        <ScorecardSummary
          holes={holes}
          scores={scores}
          labels={{
            frontNine: translations["golf.scorecard.frontNine"],
            backNine: translations["golf.scorecard.backNine"],
            diff: translations["golf.scorecard.diff"],
            total: translations["golf.scorecard.total"],
          }}
        />
      </section>
    </main>
  );
}
