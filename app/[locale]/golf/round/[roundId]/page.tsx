import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getRound, GolfRoundsError } from "@/lib/golf/rounds";
import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/routing";
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
    return (
      <main className={`app-container pb-10 ${STANDARD_PUBLIC_CONTENT_TOP_CLASS}`}>
        <div className="mx-auto max-w-lg rounded-2xl border border-border/70 bg-card p-6">
          <h1 className="font-serif text-3xl text-foreground">Round unavailable</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This course does not have a complete hole setup yet. Please try another golf
            listing for now.
          </p>
        </div>
      </main>
    );
  }

  if (!roundResult) notFound();

  return (
    <main className={`app-container pb-10 ${STANDARD_PUBLIC_CONTENT_TOP_CLASS}`}>
      <GolfRoundScoringClient initialRound={roundResult} locale={locale} />
    </main>
  );
}
