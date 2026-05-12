"use client";

import { useState } from "react";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { toast } from "@/hooks/use-toast";
import {
  getTierUpgradePrompts,
  type ListingTier,
  type TierUpgradePrompt,
} from "@/lib/listings/claim-tier";
import type { BillingPeriod } from "@/lib/stripePricing";
import { cn } from "@/lib/utils";
import { useStripeSubscription } from "@/hooks/useStripeSubscription";

interface OwnerTierUpgradeActionsProps {
  listingId: string;
  currentTier?: ListingTier | string | null;
  className?: string;
}

function getBillingPeriodForTier(tier: TierUpgradePrompt["targetTier"]): BillingPeriod {
  return tier === "signature" ? "annual" : "monthly";
}

export function OwnerTierUpgradeActions({
  listingId,
  currentTier,
  className,
}: OwnerTierUpgradeActionsProps) {
  const { t } = useTranslation();
  const { createCheckout, isLoading } = useStripeSubscription();
  const [activeTarget, setActiveTarget] = useState<TierUpgradePrompt["targetTier"] | null>(null);
  const prompts = getTierUpgradePrompts(currentTier);

  if (prompts.length === 0) return null;

  const handleUpgrade = async (prompt: TierUpgradePrompt) => {
    setActiveTarget(prompt.targetTier);
    try {
      await createCheckout(prompt.targetTier, getBillingPeriodForTier(prompt.targetTier), {
        listingId,
      });
    } catch (error) {
      toast({
        title: t("owner.tierPrompts.checkoutFailed", {
          defaultValue: "Could not start checkout",
        }),
        description:
          error instanceof Error
            ? error.message
            : t("owner.tierPrompts.checkoutFailedDescription", {
                defaultValue: "Please try again or contact support.",
              }),
        variant: "destructive",
      });
      setActiveTarget(null);
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {prompts.map((prompt) => {
        const isActive = activeTarget === prompt.targetTier;
        return (
          <Button
            key={prompt.targetTier}
            type="button"
            variant={prompt.targetTier === "signature" ? "primary" : "outline"}
            size="sm"
            title={prompt.description}
            disabled={isLoading}
            onClick={() => handleUpgrade(prompt)}
          >
            {isActive ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t(`owner.tierPrompts.${prompt.targetTier}`, { defaultValue: prompt.label })}
            {!isActive ? <ArrowUpRight className="h-4 w-4" /> : null}
          </Button>
        );
      })}
    </div>
  );
}
