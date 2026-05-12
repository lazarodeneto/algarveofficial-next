import { CheckCircle2, Clock, HelpCircle, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { Database } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type ListingClaimStatus = Database["public"]["Enums"]["listing_claim_status"];

interface ClaimStatusBadgeOwnerProps {
  status?: ListingClaimStatus | null;
  size?: "sm" | "md";
}

const statusConfig: Record<
  ListingClaimStatus,
  { key: string; defaultLabel: string; icon: typeof HelpCircle; classes: string }
> = {
  unclaimed: {
    key: "owner.claimStatus.unclaimed",
    defaultLabel: "Unclaimed",
    icon: HelpCircle,
    classes: "border-border bg-muted/70 text-muted-foreground",
  },
  claim_pending: {
    key: "owner.claimStatus.claimPending",
    defaultLabel: "Claim pending",
    icon: Clock,
    classes: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  claimed: {
    key: "owner.claimStatus.claimed",
    defaultLabel: "Claimed",
    icon: CheckCircle2,
    classes: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  disputed: {
    key: "owner.claimStatus.disputed",
    defaultLabel: "Disputed",
    icon: ShieldAlert,
    classes: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  },
};

export function ClaimStatusBadgeOwner({ status, size = "md" }: ClaimStatusBadgeOwnerProps) {
  const { t } = useTranslation();
  const resolvedStatus = status ?? "unclaimed";
  const config = statusConfig[resolvedStatus] ?? statusConfig.unclaimed;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        config.classes,
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      {t(config.key, { defaultValue: config.defaultLabel })}
    </span>
  );
}
