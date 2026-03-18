"use client";
import { Crown, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface ListingTierBadgeProps {
  tier?: string | null;
  size?: "sm" | "md";
  className?: string;
}

export default function ListingTierBadge({ tier, size = "md", className }: ListingTierBadgeProps) {
  const { t } = useTranslation();

  if (tier !== "signature" && tier !== "verified") return null;

  const base =
    "inline-flex items-center rounded-md font-black uppercase tracking-[0.12em] ring-1 backdrop-blur-sm shadow-lg";

  const sizeClass =
    size === "sm"
      ? "gap-1.5 px-2.5 py-1 text-[10px]"
      : "gap-2 px-3.5 py-1.5 text-[11px]";

  if (tier === "signature") {
    return (
      <span
        className={cn(
          base,
          sizeClass,
          "bg-gradient-to-r from-[hsl(43,74%,56%)] via-[hsl(43,78%,50%)] to-[hsl(38,82%,42%)] text-black ring-[hsl(43,80%,66%)] shadow-[0_10px_28px_-10px_hsla(43,90%,55%,0.9)]",
          className
        )}
      >
        <Crown className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
        {t("common.signature").toUpperCase()}
      </span>
    );
  }

  return (
    <span
      className={cn(
        base,
        sizeClass,
        "bg-emerald-600 text-white ring-emerald-300/60 shadow-[0_10px_28px_-10px_rgba(16,185,129,0.95)]",
        className
      )}
    >
      <ShieldCheck className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      {t("common.verified").toUpperCase()}
    </span>
  );
}
