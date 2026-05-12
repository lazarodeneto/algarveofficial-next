"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalePath } from "@/hooks/useLocalePath";

interface OwnerUpgradeStatusProps {
  status: "success" | "cancel";
}

export default function OwnerUpgradeStatus({ status }: OwnerUpgradeStatusProps) {
  const { t } = useTranslation();
  const l = useLocalePath();
  const searchParams = useSearchParams();
  const listingId = searchParams.get("listing_id");
  const targetTier = searchParams.get("target_tier");
  const isSuccess = status === "success";

  return (
    <div className="mx-auto flex min-h-[55vh] w-full max-w-2xl items-center justify-center px-4 py-10">
      <Card className="w-full border-border bg-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-muted/30">
            {isSuccess ? (
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            ) : (
              <XCircle className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <CardTitle className="font-serif text-2xl">
            {isSuccess
              ? t("owner.upgrade.successTitle", {
                  defaultValue: "Your upgrade is being activated.",
                })
              : t("owner.upgrade.cancelTitle", {
                  defaultValue: "Your upgrade was not completed.",
                })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-center">
          <p className="text-sm leading-6 text-muted-foreground">
            {isSuccess
              ? t("owner.upgrade.successDescription", {
                  defaultValue:
                    "Stripe is confirming the payment. The listing tier updates from the secure webhook as soon as the payment is confirmed.",
                })
              : t("owner.upgrade.cancelDescription", {
                  defaultValue:
                    "No upgrade was applied. You can restart checkout from your owner listing dashboard.",
                })}
          </p>
          {targetTier ? (
            <p className="rounded-md border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              {t("owner.upgrade.targetTier", {
                defaultValue: "Requested tier: {{tier}}",
                tier: targetTier,
              })}
            </p>
          ) : null}
          <div className="flex flex-col justify-center gap-2 sm:flex-row">
            {listingId ? (
              <Button asChild>
                <Link href={l(`/owner/listings/${listingId}`)}>
                  {t("owner.upgrade.backToListing", { defaultValue: "Back to listing" })}
                </Link>
              </Button>
            ) : null}
            <Button variant={listingId ? "outline" : "primary"} asChild>
              <Link href={l("/owner/listings")}>
                {t("owner.upgrade.backToListings", { defaultValue: "Back to listings" })}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
