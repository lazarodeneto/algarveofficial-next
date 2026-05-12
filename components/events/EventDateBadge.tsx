"use client";

import { cn } from "@/lib/utils";

interface EventDateBadgeProps {
  primary: string;
  secondary: string;
  className?: string;
}

function getRangeParts(primary: string) {
  const match = primary.trim().match(/^(\d{1,2})\s*-\s*(\d{1,2})$/);
  return match ? [match[1], match[2]] : null;
}

export function EventDateBadge({ primary, secondary, className }: EventDateBadgeProps) {
  const normalizedPrimary = primary.replace(/\n/g, " ").trim();
  const normalizedSecondary = secondary.replace(/\n/g, " ").trim();
  const rangeParts = getRangeParts(normalizedPrimary);
  const isLongLabel = normalizedPrimary.length > 6 && !rangeParts;
  const isShortLabel = normalizedPrimary.length <= 3 && !rangeParts;

  return (
    <div
      className={cn(
        "absolute left-3 top-3 z-20 flex h-[4.65rem] w-[5.65rem] shrink-0 items-center justify-center overflow-hidden rounded-[1.05rem] border border-white/75 bg-white px-2 text-center shadow-[0_14px_24px_-18px_rgba(15,23,42,0.8)] sm:h-[4.85rem] sm:w-[5.85rem] sm:rounded-[1.15rem]",
        className,
      )}
    >
      <div className="flex min-w-0 max-w-full flex-col items-center justify-center gap-[0.3rem]">
        {rangeParts ? (
          <span className="flex max-w-full items-baseline justify-center whitespace-nowrap font-black leading-none text-slate-950 tabular-nums text-[1.48rem] sm:text-[1.58rem]">
            <span>{rangeParts[0]}</span>
            <span className="px-0.5">-</span>
            <span>{rangeParts[1]}</span>
          </span>
        ) : (
          <span
            className={cn(
              "block max-w-full font-black leading-none text-slate-950 tabular-nums",
              isLongLabel
                ? "text-[0.58rem] leading-[0.95] sm:text-[0.64rem]"
                : isShortLabel
                  ? "text-[1.54rem] sm:text-[1.68rem]"
                  : "text-[1.38rem] sm:text-[1.52rem]",
            )}
          >
            {normalizedPrimary}
          </span>
        )}
        <span
          className="block max-w-full whitespace-nowrap text-[0.62rem] font-extrabold uppercase leading-none tracking-[-0.015em] text-red-600 sm:text-[0.66rem]"
        >
          {normalizedSecondary}
        </span>
      </div>
    </div>
  );
}
