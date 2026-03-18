import { Circle } from "lucide-react";
import type { ListingTier } from "@/types/admin";
import { cn } from "@/lib/utils";
import ListingTierBadge from "@/components/ui/ListingTierBadge";

interface TierBadgeProps {
  tier: ListingTier;
  size?: "sm" | "md";
}

export function TierBadge({ tier, size = "md" }: TierBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  const iconSize = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
  };

  if (tier === "signature" || tier === "verified") {
    return <ListingTierBadge tier={tier} size={size} />;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded font-medium uppercase tracking-wider",
        "bg-muted text-muted-foreground border border-border",
        sizeClasses[size]
      )}
    >
      <Circle className={iconSize[size]} />
      FREE
    </span>
  );
}
