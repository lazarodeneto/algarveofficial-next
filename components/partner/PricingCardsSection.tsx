"use client";

import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Crown, ShieldCheck, Check, ArrowRight } from "lucide-react";
import {
  VERIFIED_PARTNER_FEATURES,
  SIGNATURE_PARTNER_FEATURES,
} from "@/lib/partner-subscription-content";
import { useTranslation } from "react-i18next";

interface PricingCardsSectionProps {
  onSelectVerified: () => void;
  onExpressSignatureInterest?: () => void;
  verifiedPrice?: string;
  signaturePrice?: string;
}

const FEATURE_TRANSLATION_KEYS: Record<string, string> = {
  "Verified trust badge": "partner.features.verifiedTrustBadge",
  "Enhanced business profile": "partner.features.enhancedProfile",
  "Photo gallery (up to 10 images)": "partner.features.gallery10",
  "Map priority placement": "partner.features.mapPriority",
  "Social media links": "partner.features.socialLinks",
  "WhatsApp integration": "partner.features.whatsapp",
  "CTA (Call-To-Action) button": "partner.features.ctaButton",
  "Direct contact from travelers": "partner.features.directContact",
  "Everything in Verified": "partner.features.everythingVerified",
  "Photo gallery (up to 20 images)": "partner.features.gallery20",
  "Signature Selection eligibility": "partner.features.signatureEligibility",
  "Video interview (up to 3 min)": "partner.features.videoInterview",
  "Video commercial (up to 1 min)": "partner.features.videoCommercial",
  "Social media mentions": "partner.features.socialMentions",
  "Priority visibility": "partner.features.priorityVisibility",
  "Homepage featured placement add-on": "partner.features.homepageAddOn",
};

export function PricingCardsSection({
  onSelectVerified,
  onExpressSignatureInterest,
  verifiedPrice = "€19",
  signaturePrice = "€190",
}: PricingCardsSectionProps) {
  const { t } = useTranslation();
  const translateFeature = (feature: string) => t(FEATURE_TRANSLATION_KEYS[feature] ?? feature, feature);

  return (
    <section id="pricing-section" className="overflow-x-clip py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-title text-foreground">{t("pricingCards.title")}</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            {t("pricingCards.subtitle")}{" "}
            <span className="text-foreground/60">{t("pricingCards.annualDiscount")}</span>
          </p>
        </m.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-10 items-stretch">

          {/* ── Verified (recommended, visually dominant) ── */}
          <m.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="h-full"
          >
            <div className="rounded-sm p-6 sm:p-8 h-full flex flex-col relative overflow-hidden bg-green-500/5 border-[2px] border-green-500/50 shadow-[0_0_32px_hsla(142,72%,40%,0.16)] hover:shadow-[0_0_48px_hsla(142,72%,40%,0.26)] hover:-translate-y-0.5 transition-all duration-300">

              {/* Recommended badge */}
              <div className="mb-4 flex justify-start sm:justify-end md:absolute md:right-4 md:top-4 md:mb-0">
                <span className="inline-flex items-center rounded-full bg-green-500 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-green-600/20">
                  {t("pricingCards.recommended")}
                </span>
              </div>

              <div className="mb-6 flex items-center gap-2 md:pr-28">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  {t("pricingCards.verifiedPartner")}
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">{verifiedPrice}</span>
                  <span className="text-muted-foreground text-sm">{t("pricingCards.perMonth")}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {t("pricingCards.verifiedDescription")}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {VERIFIED_PARTNER_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-foreground/80">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={2.5} />
                    {translateFeature(feature)}
                  </li>
                ))}
              </ul>

              <Button
                variant="default"
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white border border-green-500 shadow-lg shadow-green-600/20"
                onClick={onSelectVerified}
              >
                {t("pricingCards.applyAsVerified")}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                {t("pricingCards.noLongTermContract")}
              </p>
            </div>
          </m.div>

          {/* ── Signature ── */}
          <m.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="h-full"
          >
            <div className="glass-box rounded-sm p-6 sm:p-8 h-full flex flex-col relative overflow-hidden border-[2px] border-[#C7A35A]/70 ring-1 ring-[#E8C678]/35 shadow-[0_0_32px_rgba(199,163,90,0.12)] hover:shadow-[0_0_48px_rgba(199,163,90,0.2)] hover:-translate-y-0.5 transition-all duration-300">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-20 rounded-sm border-[2px] border-[#C7A35A]/85"
              />

              <div className="mb-4 flex justify-start sm:justify-end md:absolute md:right-4 md:top-4 md:mb-0">
                <span className="inline-flex items-center rounded-full bg-[#C7A35A] text-amber-950 px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-amber-700/15">
                  {t("pricingCards.available")}
                </span>
              </div>

              <div className="mb-6 flex items-center gap-2 md:pr-36">
                <Crown className="w-5 h-5 text-[#C7A35A] shrink-0" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#9B7832]">
                  {t("pricingCards.signaturePartner")}
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">{signaturePrice}</span>
                  <span className="text-muted-foreground text-sm">{t("pricingCards.perMonth")}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {t("pricingCards.signatureDescription")}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {SIGNATURE_PARTNER_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-foreground/80">
                    <Check className="w-4 h-4 text-[#C7A35A] shrink-0" strokeWidth={2.5} />
                    {translateFeature(feature)}
                  </li>
                ))}
              </ul>

              <Button
                type="button"
                variant="default"
                size="lg"
                className="w-full bg-[#C7A35A] text-amber-950 hover:bg-[#B79245] border border-[#C7A35A] shadow-lg shadow-amber-700/15"
                onClick={onExpressSignatureInterest ?? onSelectVerified}
              >
                {t("pricingCards.applyAsSignature")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-3">
                {t("pricingCards.signatureAvailableNote")}
              </p>
            </div>
          </m.div>
        </div>

        {/* Bottom note */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {t("pricingCards.wantHomepagePlacement")}{" "}
            <button
              type="button"
              onClick={onExpressSignatureInterest}
              className="text-primary underline underline-offset-2 hover:text-primary/70 transition-colors"
            >
              {t("pricingCards.contactUs")}
            </button>{" "}
            {t("pricingCards.homepagePlacementNote")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("pricingCards.notReady")}{" "}
            <button
              type="button"
              onClick={onSelectVerified}
              className="text-primary underline underline-offset-2 hover:text-primary/70 transition-colors"
            >
              {t("pricingCards.startFreeListing")}
            </button>{" "}
            {t("pricingCards.upgradeWhenReady")}
          </p>
        </div>
      </div>
    </section>
  );
}
