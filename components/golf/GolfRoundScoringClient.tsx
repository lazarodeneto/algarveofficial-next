"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, ListChecks, MapPinned } from "lucide-react";

import {
  formatVsParLabel,
  isGolfTeeColor,
  type GolfTeeColor,
  type GolfRound,
} from "@/lib/golf/round-shared";
import { buildLocalizedPath } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface GolfRoundScoringClientProps {
  initialRound: GolfRound;
  locale: string;
}

type SaveState = "idle" | "saving" | "error";

function clampScore(strokes: number) {
  return Math.max(1, Math.min(20, Math.round(strokes)));
}

function teeDistanceForHole(
  teeColor: GolfTeeColor,
  hole: GolfRound["holes"][number],
): number | null {
  const white = hole.distanceWhite;
  const yellow = hole.distanceYellow;
  const red = hole.distanceRed;

  if (teeColor === "white") return white ?? yellow ?? red;
  if (teeColor === "red") return red ?? yellow ?? white;
  return yellow ?? white ?? red;
}

function toMeters(distanceYards: number | null) {
  if (distanceYards === null || !Number.isFinite(distanceYards)) return null;
  return Math.round(distanceYards * 0.9144);
}

function teeLabel(teeColor: GolfTeeColor) {
  if (teeColor === "white") return "White";
  if (teeColor === "red") return "Red";
  return "Yellow";
}

function teeActiveButtonClass(teeColor: GolfTeeColor) {
  if (teeColor === "white") {
    return "bg-white text-slate-900 ring-2 ring-slate-300 shadow-sm";
  }

  if (teeColor === "red") {
    return "bg-rose-200/75 text-rose-900 ring-2 ring-rose-400/70 shadow-sm";
  }

  return "bg-yellow-200/80 text-yellow-900 ring-2 ring-yellow-400/80 shadow-sm";
}

function teeStatValueClass(teeColor: GolfTeeColor) {
  if (teeColor === "white") return "text-slate-900";
  if (teeColor === "red") return "text-rose-700";
  return "text-amber-700";
}

function vsParColorClass(displayedVsPar: number) {
  if (displayedVsPar < 0) return "text-emerald-600";
  if (displayedVsPar === 0) return "text-sky-600";
  if (displayedVsPar <= 3) return "text-amber-600";
  return "text-red-600";
}

const TEE_COLORS: GolfTeeColor[] = ["white", "yellow", "red"];

export function GolfRoundScoringClient({
  initialRound,
  locale,
}: GolfRoundScoringClientProps) {
  const [teeColor, setTeeColor] = useState<GolfTeeColor>(initialRound.teeColor);
  const [scores, setScores] = useState<Record<number, number | null>>(() =>
    Object.fromEntries(initialRound.holes.map((hole) => [hole.holeNumber, hole.strokes])),
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [isUpdatingTee, setIsUpdatingTee] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const firstUnscoredHoleIndex = useMemo(
    () => initialRound.holes.findIndex((hole) => scores[hole.holeNumber] === null),
    [initialRound.holes, scores],
  );

  const [currentHoleIndex, setCurrentHoleIndex] = useState(() =>
    firstUnscoredHoleIndex >= 0 ? firstUnscoredHoleIndex : 0,
  );

  const currentHole = initialRound.holes[currentHoleIndex];

  const enteredHoles = useMemo(
    () => Object.values(scores).filter((value) => typeof value === "number").length,
    [scores],
  );

  const currentHoleDistanceYards = currentHole
    ? teeDistanceForHole(teeColor, currentHole)
    : null;
  const currentHoleDistanceMeters = toMeters(currentHoleDistanceYards);
  const displayedStrokes = currentHole
    ? scores[currentHole.holeNumber] ?? currentHole.par
    : 0;
  const displayedVsPar = currentHole ? displayedStrokes - currentHole.par : 0;

  const courseHref = buildLocalizedPath(locale, `/golf/courses/${initialRound.course.slug}`);
  const scorecardHref = buildLocalizedPath(
    locale,
    `/golf/round/${initialRound.id}/scorecard`,
  );

  async function persistHoleScore(holeNumber: number, strokes: number) {
    setSaveState("saving");
    setErrorMessage(null);

    try {
      const response = await fetch(
        `/api/golf/rounds/${initialRound.id}/holes/${holeNumber}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ strokes }),
        },
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        throw new Error(payload?.error?.message ?? "Unable to save score.");
      }

      setSaveState("idle");
    } catch (error) {
      setSaveState("error");
      setErrorMessage(error instanceof Error ? error.message : "Unable to save score.");
    }
  }

  async function persistTeeColor(nextTeeColor: GolfTeeColor) {
    setIsUpdatingTee(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/golf/rounds/${initialRound.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teeColor: nextTeeColor }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        throw new Error(payload?.error?.message ?? "Unable to update tee color.");
      }
      return true;
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update tee color.",
      );
      return false;
    } finally {
      setIsUpdatingTee(false);
    }
  }

  function handleAdjustStroke(delta: number) {
    if (!currentHole) return;

    const current = scores[currentHole.holeNumber] ?? currentHole.par;
    const next = clampScore(current + delta);
    if (next === current) return;

    setScores((previous) => ({
      ...previous,
      [currentHole.holeNumber]: next,
    }));

    void persistHoleScore(currentHole.holeNumber, next);
  }

  function goToPreviousHole() {
    setCurrentHoleIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }

  function goToNextHole() {
    setCurrentHoleIndex((prev) =>
      prev < initialRound.holes.length - 1 ? prev + 1 : prev,
    );
  }

  function handleTeeColorSelection(nextTeeColor: GolfTeeColor) {
    if (!isGolfTeeColor(nextTeeColor) || nextTeeColor === teeColor) return;
    const previous = teeColor;
    setTeeColor(nextTeeColor);
    void persistTeeColor(nextTeeColor).then((saved) => {
      if (!saved) setTeeColor(previous);
    });
  }

  if (!currentHole) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card p-6">
        <p className="text-sm text-muted-foreground">No hole data is available for this round.</p>
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_10px_30px_-25px_rgba(15,23,42,0.65)]">
      <header className="border-b border-border/70 p-4">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href={courseHref}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{initialRound.course.name}</p>
            <p className="text-xs text-muted-foreground">
              {enteredHoles} of {initialRound.holes.length} holes entered
            </p>
          </div>

          <Button asChild variant="outline" size="sm">
            <Link href={scorecardHref}>
              <ListChecks className="h-4 w-4" />
              Score
            </Link>
          </Button>
        </div>
      </header>

      <div className="space-y-5 p-4">
        <div className="grid grid-cols-3 gap-2 rounded-xl border border-border/60 bg-muted/20 p-1">
          {TEE_COLORS.map((option) => {
            const isActive = option === teeColor;
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleTeeColorSelection(option)}
                disabled={isUpdatingTee}
                aria-pressed={isActive}
                className={cn(
                  "rounded-lg px-2 py-2 text-sm font-semibold transition-all duration-200",
                  isActive
                    ? teeActiveButtonClass(option)
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {teeLabel(option)}
              </button>
            );
          })}
        </div>

        <div className="space-y-2 text-center">
          <p className="mx-auto inline-flex rounded-full border border-border/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Hole {currentHole.holeNumber} / {initialRound.holes.length}
          </p>
          <p className="font-serif text-7xl leading-none text-foreground">
            {String(currentHole.holeNumber).padStart(2, "0")}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2 rounded-xl border border-border/60 bg-muted/10 p-3 text-center">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Par
            </p>
            <p className="text-3xl font-serif">{currentHole.par}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Yards
            </p>
            <p className={cn("text-3xl font-serif transition-colors", teeStatValueClass(teeColor))}>
              {currentHoleDistanceYards ?? "—"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Metres
            </p>
            <p className={cn("text-3xl font-serif transition-colors", teeStatValueClass(teeColor))}>
              {currentHoleDistanceMeters ?? "—"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              S.I.
            </p>
            <p className="text-3xl font-serif">{currentHole.strokeIndex ?? "—"}</p>
          </div>
        </div>

        <div className="grid min-h-[146px] grid-cols-[90px_1fr_90px] items-center gap-4">
          <button
            type="button"
            onClick={() => handleAdjustStroke(-1)}
            className="inline-flex h-[82px] w-[82px] items-center justify-center rounded-2xl border border-border/70 text-5xl text-foreground transition-colors hover:bg-muted/30"
            aria-label="Decrease strokes"
          >
            -
          </button>

          <div className="space-y-1 text-center">
            <p className="font-serif text-7xl leading-none">{displayedStrokes}</p>
            <p className="text-sm font-semibold text-foreground">Strokes</p>
            <p
              className={cn("text-sm font-semibold", vsParColorClass(displayedVsPar))}
            >
              {formatVsParLabel(displayedVsPar)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleAdjustStroke(1)}
            className="inline-flex h-[82px] w-[82px] items-center justify-center rounded-2xl border border-[#C7A35A]/60 text-5xl text-[#C7A35A] transition-colors hover:bg-[#C7A35A]/10"
            aria-label="Increase strokes"
          >
            +
          </button>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/10 p-3">
          <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <MapPinned className="h-4 w-4" />
            Hole {currentHole.holeNumber}
          </span>
          <span
            className={cn(
              "text-xs font-semibold",
              saveState === "error"
                ? "text-destructive"
                : saveState === "saving"
                  ? "text-amber-600"
                  : "text-emerald-600",
            )}
          >
            {saveState === "error"
              ? "Save failed"
              : saveState === "saving"
                ? "Saving..."
                : "Saved"}
          </span>
        </div>

        <div className="grid grid-cols-[44px_1fr] items-center gap-3">
          <button
            type="button"
            onClick={goToPreviousHole}
            disabled={currentHoleIndex === 0}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition-colors hover:bg-muted/30 disabled:opacity-50"
            aria-label="Previous hole"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          {currentHoleIndex >= initialRound.holes.length - 1 ? (
            <Link
              href={scorecardHref}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 px-4 text-sm font-semibold text-white transition-colors hover:brightness-110"
            >
              Open Scorecard
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={goToNextHole}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 px-4 text-sm font-semibold text-white transition-colors hover:brightness-110"
            >
              {`Next Hole ${currentHole.holeNumber + 1}`}
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {errorMessage ? (
          <p className="text-xs text-destructive">{errorMessage}</p>
        ) : null}
      </div>
    </section>
  );
}
