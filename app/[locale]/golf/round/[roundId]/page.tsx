import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getRound, GolfRoundsError } from "@/lib/golf/rounds";
import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/routing";
import { getServerTranslations } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import { createClient } from "@/lib/supabase/server";
import { GolfRoundScoringClient } from "@/components/golf/GolfRoundScoringClient";
import { STANDARD_PUBLIC_CONTENT_TOP_CLASS } from "@/components/sections/hero-layout";

interface PageProps {
  params: Promise<{ locale: string; roundId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, roundId } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  return buildLocalizedMetadata({
    locale,
    path: `/golf/round/${roundId}`,
    title: "Golf Round Tracker",
    description:
      "Track strokes hole by hole and keep your Algarve golf score updated in real time.",
    keywords: ["golf round tracker", "golf scorecard", "Algarve golf"],
  });
}

export default async function GolfRoundPage({ params }: PageProps) {
  const { locale: rawLocale, roundId } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  const authClient = await createClient();
  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser();

  if (userError || !user) {
    const requestedPath = buildLocalizedPath(locale, `/golf/round/${roundId}`);
    redirect(buildLocalizedPath(locale, `/login?next=${encodeURIComponent(requestedPath)}`));
  }

  const roundResult = await getRound({ roundId, userId: user.id }).catch((error: unknown) => {
    if (error instanceof GolfRoundsError && error.code === "INVALID_INPUT") {
      notFound();
    }

    if (error instanceof GolfRoundsError && error.code === "NO_HOLES_CONFIGURED") {
      return "no-holes" as const;
    }

    throw error;
  });

  if (roundResult === "no-holes") {
    const translations = await getServerTranslations(locale, [
      "golf.round.unavailableTitle",
      "golf.round.unavailableDescription",
    ]);

    return (
      <main className={`app-container overflow-x-hidden pb-10 ${STANDARD_PUBLIC_CONTENT_TOP_CLASS}`}>
        <div className="mx-auto max-w-lg rounded-2xl border border-border/70 bg-card p-6">
          <h1 className="font-serif text-3xl text-foreground">
            {translations["golf.round.unavailableTitle"] ?? "Round unavailable"}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {translations["golf.round.unavailableDescription"] ??
              "This course does not have a complete hole setup yet. Please try another golf listing for now."}
          </p>
        </div>
      </main>
    );
  }

  if (!roundResult) notFound();
  const translations = await getServerTranslations(locale, [
    "golf.round.back",
    "golf.round.scorecard",
    "golf.round.holesEntered",
    "golf.round.noHoleData",
    "golf.round.yards",
    "golf.round.strokeIndex",
    "golf.round.strokes",
    "golf.round.decreaseStrokes",
    "golf.round.increaseStrokes",
    "golf.round.saveFailed",
    "golf.round.saving",
    "golf.round.saved",
    "golf.round.previousHole",
    "golf.round.nextHole",
    "golf.round.openScorecard",
    "golf.round.unableToSaveScore",
    "golf.round.unableToUpdateTee",
    "golfCourse.white",
    "golfCourse.yellow",
    "golfCourse.red",
    "golfCourse.hole",
    "golfCourse.par",
    "golfCourse.meters",
    "golfCourse.scorecard",
    "golfCourse.score",
  ]);

  return (
    <main className={`app-container overflow-x-hidden pb-10 ${STANDARD_PUBLIC_CONTENT_TOP_CLASS}`}>
      <GolfRoundScoringClient
        initialRound={roundResult}
        locale={locale}
        labels={{
          back: translations["golf.round.back"] ?? "Back",
          scorecard:
            translations["golf.round.scorecard"] ??
            translations["golfCourse.scorecard"] ??
            "Scorecard",
          holesEntered:
            translations["golf.round.holesEntered"] ??
            "{{entered}} of {{total}} holes entered",
          noHoleData:
            translations["golf.round.noHoleData"] ??
            "No hole data is available for this round.",
          white: translations["golfCourse.white"] ?? "White",
          yellow: translations["golfCourse.yellow"] ?? "Yellow",
          red: translations["golfCourse.red"] ?? "Red",
          hole: translations["golfCourse.hole"] ?? "Hole",
          par: translations["golfCourse.par"] ?? "Par",
          yards: translations["golf.round.yards"] ?? "Yards",
          metres: translations["golfCourse.meters"] ?? "Metres",
          strokeIndex: translations["golf.round.strokeIndex"] ?? "S.I.",
          strokes: translations["golf.round.strokes"] ?? "Strokes",
          decreaseStrokes: translations["golf.round.decreaseStrokes"] ?? "Decrease strokes",
          increaseStrokes: translations["golf.round.increaseStrokes"] ?? "Increase strokes",
          saveFailed: translations["golf.round.saveFailed"] ?? "Save failed",
          saving: translations["golf.round.saving"] ?? "Saving...",
          saved: translations["golf.round.saved"] ?? "Saved",
          previousHole: translations["golf.round.previousHole"] ?? "Previous hole",
          nextHole: translations["golf.round.nextHole"] ?? "Next Hole {{hole}}",
          openScorecard: translations["golf.round.openScorecard"] ?? "Open Scorecard",
          unableToSaveScore:
            translations["golf.round.unableToSaveScore"] ?? "Unable to save score.",
          unableToUpdateTee:
            translations["golf.round.unableToUpdateTee"] ?? "Unable to update tee color.",
        }}
      />
    </main>
  );
}
