"use client";

import { Crown, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { getPublicClaimTierBadge } from "@/lib/listings/claim-tier";
import { cn } from "@/lib/utils";

interface ClaimedListingTierBadgeProps {
  claimStatus?: string | null;
  tier?: string | null;
  className?: string;
}

export function ClaimedListingTierBadge({ claimStatus, tier, className }: ClaimedListingTierBadgeProps) {
  const { t } = useTranslation();
  const badge = getPublicClaimTierBadge({ claimStatus, listingTier: tier });

  if (!badge) return null;

  const isSignature = badge.tier === "signature";
  const Icon = isSignature ? Crown : ShieldCheck;
  const label = isSignature
    ? t("claimBusiness.tier.signature", { defaultValue: badge.label })
    : t("claimBusiness.tier.verified", { defaultValue: badge.label });
  const description = isSignature
    ? t("listing.claimTier.signatureDescription", { defaultValue: badge.description })
    : t("listing.claimTier.verifiedDescription", { defaultValue: badge.description });

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm",
        isSignature
          ? "border-amber-300/70 bg-amber-100/85 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200"
          : "border-emerald-300/70 bg-emerald-100/85 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-200",
        className,
      )}
      title={description}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </span>
  );
}
