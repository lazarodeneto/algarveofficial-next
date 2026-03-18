import { cn } from "@/lib/utils";
import { Crown, ShieldCheck } from "lucide-react";
import type { ListingTier } from "@/types/admin";
import ListingTierBadge from "@/components/ui/ListingTierBadge";

interface TierBadgeOwnerProps {
  tier: ListingTier;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function TierBadgeOwner({ tier, size = "md", showLabel = true }: TierBadgeOwnerProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const iconSize = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  if (showLabel && (tier === "signature" || tier === "verified")) {
    const badgeSize = size === "sm" ? "sm" : "md";
    const sizeTweaks = size === "lg" ? "gap-2 px-4 py-1.5 text-xs" : undefined;
    return <ListingTierBadge tier={tier} size={badgeSize} className={sizeTweaks} />;
  }

  if (tier === "signature") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded font-semibold uppercase tracking-wider",
          "bg-gradient-to-r from-[hsl(43,74%,49%)] to-[hsl(43,80%,35%)] text-black",
          sizeClasses[size]
        )}
      >
        <Crown className={iconSize[size]} />
        {showLabel && "SIGNATURE"}
      </span>
    );
  }

  if (tier === "verified") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded font-semibold uppercase tracking-wider",
          "bg-green-600 text-white",
          sizeClasses[size]
        )}
      >
        <ShieldCheck className={iconSize[size]} />
        {showLabel && "VERIFIED"}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded font-medium uppercase tracking-wider",
        "bg-muted text-muted-foreground border border-border",
        sizeClasses[size]
      )}
    >
      {showLabel && "FREE"}
    </span>
  );
}
