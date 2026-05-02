"use client";

import { m } from "framer-motion";
import Link from "next/link";
import { Check, Minus, Crown, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { ORDERED_PARTNER_FEATURE_ROWS } from "@/lib/partner-subscription-content";
import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/hooks/useLocalePath";
import { Button } from "@/components/ui/Button";

interface Feature {
  label: string;
  free: boolean;
  verified: boolean;
  signature: boolean;
  addOn?: boolean;
}

const ORDERED_FEATURES: Feature[] = ORDERED_PARTNER_FEATURE_ROWS;

const FEATURE_ROW_TRANSLATION_KEYS: Record<string, string> = {
  "Directory listing": "partner.features.directoryListing",
  "Map visibility": "partner.features.mapVisibility",
  "Basic business profile": "partner.features.basicProfile",
  "Verified trust badge": "partner.features.verifiedTrustBadge",
  "Enhanced business profile": "partner.features.enhancedProfile",
  "Photo gallery (up to 10 images)": "partner.features.gallery10",
  "Photo gallery (up to 20 images)": "partner.features.gallery20",
  "Social media links": "partner.features.socialLinks",
  "Social media mentions": "partner.features.socialMentions",
  "Video interview (up to 3 min)": "partner.features.videoInterview",
  "Video commercial (up to 1 min)": "partner.features.videoCommercial",
  "Direct contact from travelers": "partner.features.directContact",
  "Map priority placement": "partner.features.mapPriority",
  "CTA (Call-To-Action) button": "partner.features.ctaButton",
  "Signature Selection eligibility": "partner.features.signatureEligibility",
  "WhatsApp integration": "partner.features.whatsapp",
  "Priority visibility": "partner.features.priorityVisibility",
  "Homepage featured placement": "partner.features.homepagePlacement",
};

function Cell({ value, className }: { value: boolean; className?: string }) {
  return value ? (
    <Check className={cn("h-4 w-4 text-primary", className)} strokeWidth={2.5} />
  ) : (
    <Minus className={cn("h-3.5 w-3.5 text-muted-foreground/25", className)} />
  );
}

interface PricingFeaturesTableProps {
  verifiedPrice?: string;
  onSelectVerified?: () => void;
  onSelectSignature?: () => void;
}

export function PricingFeaturesTable({
  verifiedPrice = "€19",
  onSelectVerified,
  onSelectSignature,
}: PricingFeaturesTableProps) {
  const { t } = useTranslation();
  const l = useLocalePath();
  const translateFeature = (feature: string) => t(FEATURE_ROW_TRANSLATION_KEYS[feature] ?? feature, feature);

  return (
    <section className="py-20 lg:py-24 bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-title text-foreground">{t("pricingFeatures.title")}</h2>
          <p className="mt-4 text-muted-foreground">
            {t("pricingFeatures.subtitle")}
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="glass-box rounded-sm overflow-hidden"
        >
          <div className="md:hidden">
            <div className="grid grid-cols-3 gap-2 border-b border-border/30 bg-muted/10 px-4 py-4 sm:px-5">
              <div className="rounded-lg border border-border/40 bg-background/75 px-2 py-2 text-center">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("common.free")}
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground/70">
                  {t("pricingFeatures.basic")}
                </div>
              </div>

              <div className="rounded-lg border border-emerald-500/35 bg-emerald-500/5 px-2 py-2 text-center">
                <div className="flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground">
                    {t("common.verified")}
                  </span>
                </div>
                <div className="mt-0.5 text-[10px] font-semibold text-primary">
                  {verifiedPrice}
                  {t("pricingCards.perMonth")}
                </div>
              </div>

              <div className="rounded-lg border border-[#C7A35A]/35 bg-[#C7A35A]/10 px-2 py-2 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Crown className="h-3.5 w-3.5 text-[#C7A35A]" />
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground">
                    {t("common.signature")}
                  </span>
                </div>
                <div className="mt-0.5 truncate text-[10px] font-semibold text-primary">
                  {t("pricingCards.available")}
                </div>
              </div>
            </div>

            <div className="divide-y divide-border/25">
              {ORDERED_FEATURES.map((feature, i) => (
                <div
                  key={feature.label}
                  className={cn("px-4 py-4 sm:px-5", i % 2 !== 0 && "bg-muted/20")}
                >
                  <p className="text-sm leading-snug text-foreground/75">
                    {translateFeature(feature.label)}
                    {feature.addOn ? (
                      <>
                        {" "}
                        <span className="font-semibold text-primary">{t("pricingFeatures.addOn")}</span>
                        {" · "}
                        <Link href={l("/contact")} className="font-semibold text-primary underline underline-offset-2">
                          {t("pricingFeatures.contact")}
                        </Link>
                      </>
                    ) : null}
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="flex h-9 items-center justify-center rounded-md border border-border/40 bg-background/75">
                      <Cell value={feature.free} />
                    </div>
                    <div className="flex h-9 items-center justify-center rounded-md border border-emerald-500/35 bg-emerald-500/5">
                      <Cell value={feature.verified} />
                    </div>
                    <div className="flex h-9 items-center justify-center rounded-md border border-[#C7A35A]/35 bg-[#C7A35A]/10">
                      <Cell value={feature.signature} />
                    </div>
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3 bg-background/65 px-4 py-5 sm:px-5">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={onSelectVerified}
                  className="h-auto min-h-11 bg-emerald-600 px-3 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white shadow-lg shadow-emerald-600/15 hover:bg-emerald-700"
                >
                  {t("pricingCards.applyAsVerified")}
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={onSelectSignature ?? onSelectVerified}
                  className="h-auto min-h-11 bg-primary px-3 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-primary-foreground shadow-lg shadow-primary/15 hover:bg-primary/90"
                >
                  {t("pricingCards.applyAsSignature")}
                </Button>
              </div>
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[680px] lg:min-w-0">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left py-5 px-6 text-sm font-medium text-muted-foreground w-[46%]">
                    {t("pricingFeatures.feature")}
                  </th>

                  <th className="py-5 px-4 text-center min-w-[90px]">
                    <div className="text-sm font-semibold text-muted-foreground">{t("common.free")}</div>
                    <div className="text-xs text-muted-foreground/50 mt-0.5">{t("pricingFeatures.basic")}</div>
                  </th>

                  <th className="py-5 px-4 text-center min-w-[110px]">
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-sm font-semibold text-foreground">{t("common.verified")}</span>
                    </div>
                    <div className="text-xs text-primary font-semibold">{verifiedPrice}{t("pricingCards.perMonth")}</div>
                  </th>

                  <th className="py-5 px-4 text-center min-w-[120px]">
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <Crown className="w-3.5 h-3.5 text-[#C7A35A]" />
                      <span className="text-sm font-semibold text-foreground">{t("common.signature")}</span>
                    </div>
                    <div className="text-xs text-primary font-semibold">{t("pricingCards.available")}</div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {ORDERED_FEATURES.map((feature, i) => (
                  <tr
                    key={feature.label}
                    className={cn(
                      "border-b border-border/25 last:border-0 transition-colors",
                      i % 2 !== 0 && "bg-muted/20"
                    )}
                  >
                    <td className="py-3.5 px-6 text-sm text-foreground/75">
                      {translateFeature(feature.label)}
                      {feature.addOn ? (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs">
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold uppercase tracking-[0.12em] text-primary">
                            {t("pricingFeatures.addOn")}
                          </span>
                          <Link href={l("/contact")} className="font-semibold text-primary underline underline-offset-2">
                            {t("pricingFeatures.contact")}
                          </Link>
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3.5 px-4 text-center"><Cell value={feature.free} className="mx-auto" /></td>
                    <td className="py-3.5 px-4 text-center"><Cell value={feature.verified} className="mx-auto" /></td>
                    <td className="py-3.5 px-4 text-center"><Cell value={feature.signature} className="mx-auto" /></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-background/65">
                  <td className="px-6 py-5 text-sm font-medium text-muted-foreground">
                    {t("pricingFeatures.apply")}
                  </td>
                  <td className="px-4 py-5 text-center">
                    <Minus className="mx-auto h-3.5 w-3.5 text-muted-foreground/25" />
                  </td>
                  <td className="px-4 py-5 text-center">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={onSelectVerified}
                      className="min-w-[10rem] bg-emerald-600 text-white shadow-lg shadow-emerald-600/15 hover:bg-emerald-700"
                    >
                      {t("pricingCards.applyAsVerified")}
                    </Button>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={onSelectSignature ?? onSelectVerified}
                      className="min-w-[10rem] bg-primary text-primary-foreground shadow-lg shadow-primary/15 hover:bg-primary/90"
                    >
                      {t("pricingCards.applyAsSignature")}
                    </Button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </m.div>
      </div>
    </section>
  );
}
