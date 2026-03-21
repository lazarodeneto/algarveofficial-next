import { Crown, ShieldCheck, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { getTierBadgeClasses, getTier } from "@/lib/tier-design";

interface ListingTierBadgeProps {
  tier?: string | null;
  size?: "sm" | "md";
  className?: string;
}

export default function ListingTierBadge({ tier, size = "md", className }: ListingTierBadgeProps) {
  const { t } = useTranslation();
  const tierType = getTier(tier);

  if (tierType === "unverified" || !tier) return null;

  const badgeClass = getTierBadgeClasses(tier, size);

  if (tierType === "verified") {
    return (
      <span className={cn(badgeClass, className)}>
        <ShieldCheck className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
        {t("common.verified").toUpperCase()}
      </span>
    );
  }

  if (tierType === "signature") {
    return (
      <span className={cn(badgeClass, className)}>
        <Crown className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
        {t("common.signature").toUpperCase()}
      </span>
    );
  }

  if (tierType === "curated") {
    return (
      <span className={cn(badgeClass, className)}>
        <Star className={size === "sm" ? "h-3.5 w-3.5 fill-current" : "h-4 w-4 fill-current"} />
        {t("common.curated", "Curated").toUpperCase()}
      </span>
    );
  }

  return null;
}
