"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { GolfTeeColor } from "@/lib/golf/round-shared";
import { buildLocalizedPath } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

interface StartRoundButtonProps {
  listingId: string;
  courseSlug: string;
  locale: string;
}

const TEE_COLORS: GolfTeeColor[] = ["white", "yellow", "red"];

function toTeeLabel(teeColor: GolfTeeColor) {
  switch (teeColor) {
    case "white":
      return "White";
    case "red":
      return "Red";
    case "yellow":
    default:
      return "Yellow";
  }
}

export function StartRoundButton({
  listingId,
  courseSlug,
  locale,
}: StartRoundButtonProps) {
  const router = useRouter();
  const [teeColor, setTeeColor] = useState<GolfTeeColor>("yellow");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleStartRound() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/golf/rounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, teeColor }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; data?: { roundId?: string }; error?: { message?: string } }
        | null;

      if (response.status === 401) {
        const nextPath = buildLocalizedPath(locale, `/golf/courses/${courseSlug}`);
        router.push(buildLocalizedPath(locale, `/login?next=${encodeURIComponent(nextPath)}`));
        return;
      }

      if (!response.ok || !payload?.data?.roundId) {
        setErrorMessage(payload?.error?.message ?? "Unable to start a round right now.");
        return;
      }

      router.push(buildLocalizedPath(locale, `/golf/round/${payload.data.roundId}`));
    } catch {
      setErrorMessage("Unable to start a round right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border border-white/30 bg-white/40 p-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <div className="pointer-events-none absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#C7A35A] to-transparent opacity-70" />

        <div className="flex items-center gap-2 rounded-full bg-white/30 p-1 backdrop-blur-md">
          {TEE_COLORS.map((option) => {
            const isActive = option === teeColor;
            const activeClass =
              option === "white"
                ? "bg-white/70 text-slate-900 ring-2 ring-slate-300 shadow"
                : option === "yellow"
                  ? "bg-yellow-200/70 text-yellow-900 ring-2 ring-yellow-400 shadow"
                  : "bg-red-200/70 text-red-900 ring-2 ring-red-400 shadow";

            return (
              <button
                key={option}
                type="button"
                onClick={() => setTeeColor(option)}
                className={cn(
                  "flex-1 rounded-full py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? cn(activeClass, "scale-[1.02]")
                    : "text-slate-500 hover:bg-white/40",
                )}
                aria-pressed={isActive}
              >
                {toTeeLabel(option)}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={handleStartRound}
        disabled={isSubmitting}
        className={cn(
          "mt-4 w-full rounded-full bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-500 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(16,185,129,0.35)] transition-all duration-200 hover:shadow-[0_12px_30px_rgba(16,185,129,0.45)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70",
        )}
      >
        {isSubmitting ? "Starting..." : "Start Round"}
      </button>

      {errorMessage ? <p className="text-xs text-destructive">{errorMessage}</p> : null}
    </div>
  );
}
