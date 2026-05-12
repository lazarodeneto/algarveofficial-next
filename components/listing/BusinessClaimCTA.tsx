import Link from "next/link";
import { Building2, CheckCircle2, Clock3 } from "lucide-react";

import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ListingClaimStatus = Tables<"listings">["claim_status"] | null | undefined;

export type BusinessClaimCtaState = "unclaimed" | "pending" | "claimed";

export function getBusinessClaimCtaState(status: ListingClaimStatus): BusinessClaimCtaState {
  if (status === "claim_pending" || status === "disputed") return "pending";
  if (status === "claimed") return "claimed";
  return "unclaimed";
}

interface BusinessClaimCTALabels {
  title: string;
  description: string;
  button: string;
  pendingTitle: string;
  pendingDescription: string;
  claimedTitle: string;
  claimedDescription: string;
}

interface BusinessClaimCTAProps {
  claimHref: string;
  claimStatus?: ListingClaimStatus;
  labels: BusinessClaimCTALabels;
  className?: string;
}

export function BusinessClaimCTA({
  claimHref,
  claimStatus,
  labels,
  className,
}: BusinessClaimCTAProps) {
  const state = getBusinessClaimCtaState(claimStatus);
  const Icon = state === "claimed" ? CheckCircle2 : state === "pending" ? Clock3 : Building2;

  const title =
    state === "claimed" ? labels.claimedTitle : state === "pending" ? labels.pendingTitle : labels.title;
  const description =
    state === "claimed"
      ? labels.claimedDescription
      : state === "pending"
        ? labels.pendingDescription
        : labels.description;

  return (
    <Card
      className={cn(
        "rounded-xl border-[#D4A62A]/30 bg-gradient-to-br from-[#D4A62A]/10 via-background to-background shadow-[0_18px_48px_-34px_rgba(0,0,0,0.55)]",
        state === "claimed" && "border-emerald-500/30 from-emerald-500/10",
        state === "pending" && "border-amber-500/30 from-amber-500/10",
        className,
      )}
    >
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background/80",
              state === "claimed"
                ? "border-emerald-500/30 text-emerald-600"
                : state === "pending"
                  ? "border-amber-500/30 text-amber-600"
                  : "border-[#D4A62A]/35 text-[#C6961C]",
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 space-y-1">
            <h2 className="text-base font-semibold leading-snug text-foreground">{title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>
        </div>

        {state === "unclaimed" ? (
          <Button asChild size="sm" className="w-full">
            <Link href={claimHref} prefetch={false}>
              {labels.button}
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
