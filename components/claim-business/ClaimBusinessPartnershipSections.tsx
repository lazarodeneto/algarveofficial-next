import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  Compass,
  Crown,
  Flag,
  Gem,
  Home,
  Map,
  Minus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type {
  ClaimPricingBillingPeriod,
  ClaimTierPricingDetails,
} from "@/lib/claims/claim-pricing-types";
import { cn } from "@/lib/utils";

export type ClaimPartnershipTier = "free" | "verified" | "signature";

export const CLAIM_BUSINESS_PARTNERSHIP_TRANSLATION_KEYS = [
  "claimBusinessPartnership.pricing.title",
  "claimBusinessPartnership.pricing.subtitle",
  "claimBusinessPartnership.pricing.selectionHint",
  "claimBusinessPartnership.pricing.compareCta",
  "claimBusinessPartnership.tiers.unverified.name",
  "claimBusinessPartnership.tiers.unverified.price",
  "claimBusinessPartnership.tiers.unverified.priceNote",
  "claimBusinessPartnership.tiers.unverified.positioning",
  "claimBusinessPartnership.tiers.unverified.cta",
  "claimBusinessPartnership.tiers.unverified.badge",
  "claimBusinessPartnership.tiers.verified.name",
  "claimBusinessPartnership.tiers.verified.price",
  "claimBusinessPartnership.tiers.verified.priceNote",
  "claimBusinessPartnership.tiers.verified.positioning",
  "claimBusinessPartnership.tiers.verified.cta",
  "claimBusinessPartnership.tiers.verified.badge",
  "claimBusinessPartnership.tiers.signature.name",
  "claimBusinessPartnership.tiers.signature.price",
  "claimBusinessPartnership.tiers.signature.priceNote",
  "claimBusinessPartnership.tiers.signature.positioning",
  "claimBusinessPartnership.tiers.signature.cta",
  "claimBusinessPartnership.tiers.signature.badge",
  "claimBusinessPartnership.features.basicDirectory",
  "claimBusinessPartnership.features.basicMap",
  "claimBusinessPartnership.features.basicProfile",
  "claimBusinessPartnership.features.publicReview",
  "claimBusinessPartnership.features.limitedVisibility",
  "claimBusinessPartnership.features.noVerifiedBadge",
  "claimBusinessPartnership.features.noPriorityPlacement",
  "claimBusinessPartnership.features.noPremiumCta",
  "claimBusinessPartnership.features.upgradeAnytime",
  "claimBusinessPartnership.features.verifiedBadge",
  "claimBusinessPartnership.features.enhancedProfile",
  "claimBusinessPartnership.features.gallery10",
  "claimBusinessPartnership.features.mapPriority",
  "claimBusinessPartnership.features.socialLinks",
  "claimBusinessPartnership.features.whatsapp",
  "claimBusinessPartnership.features.ctaButton",
  "claimBusinessPartnership.features.directContact",
  "claimBusinessPartnership.features.strongerVisibility",
  "claimBusinessPartnership.features.cancelAnytime",
  "claimBusinessPartnership.features.noContract",
  "claimBusinessPartnership.features.everythingVerified",
  "claimBusinessPartnership.features.gallery20",
  "claimBusinessPartnership.features.signatureEligibility",
  "claimBusinessPartnership.features.videoInterview",
  "claimBusinessPartnership.features.videoCommercial",
  "claimBusinessPartnership.features.socialMentions",
  "claimBusinessPartnership.features.priorityVisibility",
  "claimBusinessPartnership.features.homepageAddOn",
  "claimBusinessPartnership.features.curatedPlacement",
  "claimBusinessPartnership.features.cityCategoryEligibility",
  "claimBusinessPartnership.features.limitedAvailability",
  "claimBusinessPartnership.features.approvalRequired",
  "claimBusinessPartnership.comparison.title",
  "claimBusinessPartnership.comparison.subtitle",
  "claimBusinessPartnership.comparison.feature",
  "claimBusinessPartnership.comparison.included",
  "claimBusinessPartnership.comparison.notIncluded",
  "claimBusinessPartnership.trust.title",
  "claimBusinessPartnership.trust.subtitle",
  "claimBusinessPartnership.trust.points.review",
  "claimBusinessPartnership.trust.points.quality",
  "claimBusinessPartnership.trust.points.availability",
  "claimBusinessPartnership.trust.points.signature",
  "claimBusinessPartnership.placement.badge",
  "claimBusinessPartnership.placement.title",
  "claimBusinessPartnership.placement.subtitle",
  "claimBusinessPartnership.placement.items.homepage.title",
  "claimBusinessPartnership.placement.items.homepage.description",
  "claimBusinessPartnership.placement.items.fit.title",
  "claimBusinessPartnership.placement.items.fit.description",
  "claimBusinessPartnership.placement.items.quality.title",
  "claimBusinessPartnership.placement.items.quality.description",
  "claimBusinessPartnership.audience.badge",
  "claimBusinessPartnership.audience.title",
  "claimBusinessPartnership.audience.subtitle",
  "claimBusinessPartnership.audience.items.visitors.title",
  "claimBusinessPartnership.audience.items.visitors.description",
  "claimBusinessPartnership.audience.items.residents.title",
  "claimBusinessPartnership.audience.items.residents.description",
  "claimBusinessPartnership.audience.items.golf.title",
  "claimBusinessPartnership.audience.items.golf.description",
  "claimBusinessPartnership.audience.items.property.title",
  "claimBusinessPartnership.audience.items.property.description",
  "claimBusinessPartnership.audience.items.lifestyle.title",
  "claimBusinessPartnership.audience.items.lifestyle.description",
  "claimBusinessPartnership.faq.title",
  "claimBusinessPartnership.faq.items.claim.question",
  "claimBusinessPartnership.faq.items.claim.answer",
  "claimBusinessPartnership.faq.items.cost.question",
  "claimBusinessPartnership.faq.items.cost.answer",
  "claimBusinessPartnership.faq.items.difference.question",
  "claimBusinessPartnership.faq.items.difference.answer",
  "claimBusinessPartnership.faq.items.afterPaid.question",
  "claimBusinessPartnership.faq.items.afterPaid.answer",
  "claimBusinessPartnership.faq.items.payBeforeApproval.question",
  "claimBusinessPartnership.faq.items.payBeforeApproval.answer",
  "claimBusinessPartnership.faq.items.upgrade.question",
  "claimBusinessPartnership.faq.items.upgrade.answer",
  "claimBusinessPartnership.faq.items.cancel.question",
  "claimBusinessPartnership.faq.items.cancel.answer",
  "claimBusinessPartnership.faq.items.guarantees.question",
  "claimBusinessPartnership.faq.items.guarantees.answer",
  "claimBusinessPartnership.faq.items.approvalTime.question",
  "claimBusinessPartnership.faq.items.approvalTime.answer",
  "claimBusinessPartnership.faq.items.signatureAvailable.question",
  "claimBusinessPartnership.faq.items.signatureAvailable.answer",
] as const;

const TIER_FEATURE_KEYS: Record<ClaimPartnershipTier, string[]> = {
  free: [
    "basicDirectory",
    "basicMap",
    "basicProfile",
    "publicReview",
    "limitedVisibility",
    "noVerifiedBadge",
    "noPriorityPlacement",
    "noPremiumCta",
    "upgradeAnytime",
  ],
  verified: [
    "verifiedBadge",
    "enhancedProfile",
    "gallery10",
    "mapPriority",
    "socialLinks",
    "whatsapp",
    "ctaButton",
    "directContact",
    "strongerVisibility",
    "cancelAnytime",
    "noContract",
  ],
  signature: [
    "everythingVerified",
    "gallery20",
    "signatureEligibility",
    "videoInterview",
    "videoCommercial",
    "socialMentions",
    "priorityVisibility",
    "homepageAddOn",
    "curatedPlacement",
    "cityCategoryEligibility",
    "limitedAvailability",
    "approvalRequired",
  ],
};

const COMPARISON_ROWS = [
  { key: "basicDirectory", free: true, verified: true, signature: true },
  { key: "basicMap", free: true, verified: true, signature: true },
  { key: "basicProfile", free: true, verified: true, signature: true },
  { key: "verifiedBadge", free: false, verified: true, signature: true },
  { key: "enhancedProfile", free: false, verified: true, signature: true },
  { key: "gallery10", free: false, verified: true, signature: true },
  { key: "gallery20", free: false, verified: false, signature: true },
  { key: "socialLinks", free: false, verified: true, signature: true },
  { key: "whatsapp", free: false, verified: true, signature: true },
  { key: "ctaButton", free: false, verified: true, signature: true },
  { key: "directContact", free: false, verified: true, signature: true },
  { key: "mapPriority", free: false, verified: true, signature: true },
  { key: "signatureEligibility", free: false, verified: false, signature: true },
  { key: "videoInterview", free: false, verified: false, signature: true },
  { key: "videoCommercial", free: false, verified: false, signature: true },
  { key: "socialMentions", free: false, verified: false, signature: true },
  { key: "curatedPlacement", free: false, verified: false, signature: true },
  { key: "homepageAddOn", free: false, verified: false, signature: true },
  { key: "limitedAvailability", free: false, verified: false, signature: true },
] as const;

const AUDIENCE_ITEMS = [
  { key: "visitors", Icon: Compass },
  { key: "residents", Icon: Home },
  { key: "golf", Icon: Flag },
  { key: "property", Icon: Building2 },
  { key: "lifestyle", Icon: Gem },
] as const;

const PLACEMENT_ITEMS = [
  { key: "homepage", Icon: Sparkles },
  { key: "fit", Icon: Map },
  { key: "quality", Icon: ShieldCheck },
] as const;

const FAQ_ITEMS = [
  "claim",
  "cost",
  "difference",
  "afterPaid",
  "payBeforeApproval",
  "upgrade",
  "cancel",
  "guarantees",
  "approvalTime",
  "signatureAvailable",
] as const;

interface TranslationProps {
  tx: Record<string, string>;
}

interface PricingCardsProps extends TranslationProps {
  pricing?: ClaimTierPricingDetails;
  selectedTier?: ClaimPartnershipTier;
  selectedBillingPeriods?: Partial<Record<ClaimPartnershipTier, ClaimPricingBillingPeriod>>;
  onSelectTier?: (tier: ClaimPartnershipTier) => void;
  ctaHref?: string;
  className?: string;
  compact?: boolean;
}

function Cell({
  value,
  tx,
}: {
  value: boolean;
  tx: Record<string, string>;
}) {
  if (value) {
    return (
      <span className="inline-flex items-center justify-center text-[#C6961C]">
        <Check className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
        <span className="sr-only">{tx["claimBusinessPartnership.comparison.included"]}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center justify-center text-muted-foreground/35">
      <Minus className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">{tx["claimBusinessPartnership.comparison.notIncluded"]}</span>
    </span>
  );
}

function TierIcon({ tier }: { tier: ClaimPartnershipTier }) {
  if (tier === "verified") return <ShieldCheck className="h-5 w-5" aria-hidden="true" />;
  if (tier === "signature") return <Crown className="h-5 w-5" aria-hidden="true" />;
  return <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />;
}

function tierClasses(tier: ClaimPartnershipTier, selected: boolean | undefined) {
  if (tier === "verified") {
    return cn(
      "border-emerald-500/55 bg-emerald-500/5 shadow-[0_22px_60px_-42px_rgba(16,185,129,0.75)]",
      selected && "ring-2 ring-emerald-500/45",
    );
  }

  if (tier === "signature") {
    return cn(
      "border-[#C7A35A]/70 bg-card/85 shadow-[0_22px_60px_-42px_rgba(199,163,90,0.85)]",
      selected && "ring-2 ring-[#C7A35A]/45",
    );
  }

  return cn(
    "border-border/70 bg-card/80 shadow-[0_22px_60px_-48px_rgba(15,23,42,0.45)]",
    selected && "ring-2 ring-[#D4A62A]/35",
  );
}

export function ClaimBusinessPricingCards({
  tx,
  pricing,
  selectedTier,
  selectedBillingPeriods,
  onSelectTier,
  ctaHref,
  className,
  compact = false,
}: PricingCardsProps) {
  const tiers: ClaimPartnershipTier[] = ["free", "verified", "signature"];

  return (
    <section className={cn("space-y-8", className)} aria-labelledby="claim-pricing-title">
      <div className="mx-auto max-w-3xl text-center">
        <h2 id="claim-pricing-title" className="font-serif text-3xl leading-tight text-foreground md:text-4xl">
          {tx["claimBusinessPartnership.pricing.title"]}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
          {tx["claimBusinessPartnership.pricing.subtitle"]}
        </p>
      </div>

      <div className={cn("grid gap-5", !compact && "md:grid-cols-2 xl:grid-cols-3")}>
        {tiers.map((tier) => {
          const selected = selectedTier === tier;
          const isVerified = tier === "verified";
          const isSignature = tier === "signature";
          const keyPrefix = tier === "free" ? "unverified" : tier;
          const iconColour = isVerified
            ? "text-emerald-600"
            : isSignature
              ? "text-[#C7A35A]"
              : "text-[#9C7417]";
          const buttonClassName = isVerified
            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/15 hover:bg-emerald-700"
            : isSignature
              ? "bg-[#C7A35A] text-amber-950 shadow-lg shadow-amber-700/15 hover:bg-[#B79245]"
              : "";
          const buttonLabel = tx[`claimBusinessPartnership.tiers.${keyPrefix}.cta`];
          const pricingDetail = pricing?.[tier];
          const selectedBillingPeriod = selectedBillingPeriods?.[tier];
          const selectedPricingOption = selectedBillingPeriod
            ? pricingDetail?.options.find((option) => option.billingPeriod === selectedBillingPeriod)
            : null;
          const displayedPricing = selectedPricingOption ?? pricingDetail;
          const priceLabel = displayedPricing?.priceLabel ?? tx[`claimBusinessPartnership.tiers.${keyPrefix}.price`];
          const priceNote = displayedPricing?.cadenceLabel ?? tx[`claimBusinessPartnership.tiers.${keyPrefix}.priceNote`];
          const supportingLabel = displayedPricing?.supportingLabel;

          return (
            <article
              key={tier}
              className={cn(
                "relative flex h-full flex-col rounded-2xl border p-5 transition-all duration-200 md:p-6",
                tierClasses(tier, selected),
                isVerified && !compact && "xl:-mt-2 xl:mb-2",
                isSignature && !compact && "md:col-span-2 xl:col-span-1",
              )}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className={cn("flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em]", iconColour)}>
                  <TierIcon tier={tier} />
                  <span>{tx[`claimBusinessPartnership.tiers.${keyPrefix}.name`]}</span>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em]",
                    isVerified && "bg-emerald-500 text-white shadow-lg shadow-emerald-600/20",
                    isSignature && "bg-[#C7A35A]/80 text-amber-950 shadow-lg shadow-amber-700/15",
                    tier === "free" && "border border-border/70 bg-background/80 text-muted-foreground",
                  )}
                >
                  {tx[`claimBusinessPartnership.tiers.${keyPrefix}.badge`]}
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold leading-none text-foreground">
                    {priceLabel}
                  </span>
                  {priceNote ? <span className="text-sm text-muted-foreground">{priceNote}</span> : null}
                </div>
                {supportingLabel ? (
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {supportingLabel}
                  </p>
                ) : null}
                <p className="mt-4 min-h-[5.25rem] text-sm leading-6 text-muted-foreground">
                  {tx[`claimBusinessPartnership.tiers.${keyPrefix}.positioning`]}
                </p>
              </div>

              <ul className="mt-5 flex-1 space-y-3 text-sm text-foreground/80">
                {TIER_FEATURE_KEYS[tier].map((featureKey) => (
                  <li key={featureKey} className="flex gap-3">
                    <Check
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        isVerified ? "text-emerald-600" : isSignature ? "text-[#C7A35A]" : "text-[#C6961C]",
                      )}
                      strokeWidth={2.6}
                      aria-hidden="true"
                    />
                    <span>{tx[`claimBusinessPartnership.features.${featureKey}`]}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                {onSelectTier ? (
                  <Button
                    type="button"
                    variant={tier === "free" ? "secondary" : "default"}
                    className={cn("w-full", buttonClassName)}
                    aria-pressed={selected}
                    onClick={() => onSelectTier(tier)}
                  >
                    {buttonLabel}
                    {tier !== "free" ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
                  </Button>
                ) : ctaHref ? (
                  <Button
                    asChild
                    variant={tier === "free" ? "secondary" : "default"}
                    className={cn("w-full", buttonClassName)}
                  >
                    <Link href={ctaHref}>
                      {buttonLabel}
                      {tier !== "free" ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
                    </Link>
                  </Button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

interface ComparisonTableProps extends TranslationProps {
  pricing?: ClaimTierPricingDetails;
}

export function ClaimBusinessComparisonTable({ tx, pricing }: ComparisonTableProps) {
  const verifiedPricing = pricing?.verified;
  const signaturePricing = pricing?.signature;

  return (
    <section className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm md:p-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-serif text-3xl leading-tight text-foreground md:text-4xl">
          {tx["claimBusinessPartnership.comparison.title"]}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
          {tx["claimBusinessPartnership.comparison.subtitle"]}
        </p>
      </div>

      <div className="mt-8 grid gap-3 md:hidden">
        {COMPARISON_ROWS.map((row) => (
          <div key={row.key} className="rounded-xl border border-border/50 bg-background/70 p-4">
            <p className="text-sm font-semibold leading-5 text-foreground">
              {tx[`claimBusinessPartnership.features.${row.key}`]}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {([
                ["unverified", row.free],
                ["verified", row.verified],
                ["signature", row.signature],
              ] as const).map(([tier, included]) => (
                <div
                  key={tier}
                  className={cn(
                    "rounded-lg border px-2 py-2",
                    included
                      ? "border-[#D4A62A]/30 bg-[#D4A62A]/10 text-foreground"
                      : "border-border/40 bg-muted/20 text-muted-foreground/55",
                  )}
                >
                  <div className="flex items-center justify-center">
                    <Cell value={included} tx={tx} />
                  </div>
                  <div className="mt-1 normal-case tracking-normal">
                    {tx[`claimBusinessPartnership.tiers.${tier}.name`]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 hidden overflow-hidden rounded-2xl border border-border/50 bg-background/70 md:block">
        <table className="w-full table-fixed border-collapse">
          <caption className="sr-only">{tx["claimBusinessPartnership.comparison.title"]}</caption>
          <thead>
            <tr className="border-b border-border/50">
              <th scope="col" className="w-[42%] px-4 py-5 text-left text-sm font-medium text-muted-foreground lg:px-5">
                {tx["claimBusinessPartnership.comparison.feature"]}
              </th>
              <th scope="col" className="px-3 py-5 text-center lg:px-4">
                <span className="block text-sm font-semibold text-muted-foreground">
                  {tx["claimBusinessPartnership.tiers.unverified.name"]}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground/70">
                  {tx["claimBusinessPartnership.tiers.unverified.price"]}
                </span>
              </th>
              <th scope="col" className="px-3 py-5 text-center lg:px-4">
                <span className="flex items-center justify-center gap-1.5 text-sm font-semibold text-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  {tx["claimBusinessPartnership.tiers.verified.name"]}
                </span>
                <span className="mt-1 block text-xs font-semibold text-[#C6961C]">
                  {verifiedPricing
                    ? `${verifiedPricing.priceLabel}${verifiedPricing.cadenceLabel}`
                    : `${tx["claimBusinessPartnership.tiers.verified.price"]}${tx["claimBusinessPartnership.tiers.verified.priceNote"]}`}
                </span>
              </th>
              <th scope="col" className="px-3 py-5 text-center lg:px-4">
                <span className="flex items-center justify-center gap-1.5 text-sm font-semibold text-foreground">
                  <Crown className="h-3.5 w-3.5 text-[#C7A35A]" aria-hidden="true" />
                  {tx["claimBusinessPartnership.tiers.signature.name"]}
                </span>
                <span className="mt-1 block text-xs font-semibold text-[#C6961C]">
                  {signaturePricing
                    ? `${signaturePricing.priceLabel}${signaturePricing.cadenceLabel}`
                    : tx["claimBusinessPartnership.tiers.signature.badge"]}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, index) => (
              <tr
                key={row.key}
                className={cn("border-b border-border/30 last:border-0", index % 2 === 1 && "bg-muted/20")}
              >
                <th scope="row" className="px-4 py-4 text-left text-sm font-medium leading-5 text-foreground/75 lg:px-5">
                  {tx[`claimBusinessPartnership.features.${row.key}`]}
                </th>
                <td className="px-3 py-4 text-center lg:px-4"><Cell value={row.free} tx={tx} /></td>
                <td className="px-3 py-4 text-center lg:px-4"><Cell value={row.verified} tx={tx} /></td>
                <td className="px-3 py-4 text-center lg:px-4"><Cell value={row.signature} tx={tx} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ClaimBusinessTrustAndVisibility({ tx }: TranslationProps) {
  return (
    <div className="space-y-16">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-[#D4A62A]/25 bg-[#D4A62A]/5 p-6 md:p-8">
          <ShieldCheck className="mb-5 h-7 w-7 text-[#C6961C]" aria-hidden="true" />
          <h2 className="font-serif text-3xl leading-tight text-foreground md:text-4xl">
            {tx["claimBusinessPartnership.trust.title"]}
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            {tx["claimBusinessPartnership.trust.subtitle"]}
          </p>
          <ul className="mt-6 space-y-3 text-sm leading-6 text-foreground/80">
            {["review", "quality", "availability", "signature"].map((key) => (
              <li key={key} className="flex gap-3">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#C6961C]" aria-hidden="true" />
                <span>{tx[`claimBusinessPartnership.trust.points.${key}`]}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-box rounded-2xl p-6 md:p-8">
          <Sparkles className="mb-5 h-7 w-7 text-[#C7A35A]" aria-hidden="true" />
          <h3 className="font-serif text-2xl font-semibold text-foreground">
            {tx["claimBusinessPartnership.placement.title"]}
          </h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {tx["claimBusinessPartnership.placement.subtitle"]}
          </p>
          <div className="mt-6 grid gap-3">
            {PLACEMENT_ITEMS.map(({ key, Icon }) => (
              <div key={key} className="rounded-xl border border-border/60 bg-background/55 p-4">
                <div className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D4A62A]/10 text-[#C6961C]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h4 className="font-serif text-base font-semibold text-foreground">
                      {tx[`claimBusinessPartnership.placement.items.${key}.title`]}
                    </h4>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {tx[`claimBusinessPartnership.placement.items.${key}.description`]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C6961C]">
            {tx["claimBusinessPartnership.audience.badge"]}
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground md:text-4xl">
            {tx["claimBusinessPartnership.audience.title"]}
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            {tx["claimBusinessPartnership.audience.subtitle"]}
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {AUDIENCE_ITEMS.map(({ key, Icon }) => (
            <div key={key} className="glass-box rounded-2xl p-5">
              <Icon className="mb-4 h-5 w-5 text-[#C6961C]" aria-hidden="true" />
              <h3 className="text-sm font-semibold leading-5 text-foreground">
                {tx[`claimBusinessPartnership.audience.items.${key}.title`]}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {tx[`claimBusinessPartnership.audience.items.${key}.description`]}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function ClaimBusinessFaqSection({ tx }: TranslationProps) {
  return (
    <section className="mx-auto max-w-3xl">
      <h2 className="text-center font-serif text-3xl leading-tight text-foreground md:text-4xl">
        {tx["claimBusinessPartnership.faq.title"]}
      </h2>
      <Accordion type="single" collapsible className="mt-8 space-y-3">
        {FAQ_ITEMS.map((key) => (
          <AccordionItem
            key={key}
            value={key}
            className="glass-box rounded-2xl border border-border/60 px-5"
          >
            <AccordionTrigger className="py-4 text-left text-sm font-semibold text-foreground hover:no-underline md:text-base">
              {tx[`claimBusinessPartnership.faq.items.${key}.question`]}
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-sm leading-6 text-muted-foreground">
              {tx[`claimBusinessPartnership.faq.items.${key}.answer`]}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
