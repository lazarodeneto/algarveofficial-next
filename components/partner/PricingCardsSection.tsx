"use client";

import { m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Crown, ShieldCheck, Check, Lock } from "lucide-react";
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

export function PricingCardsSection({
  onSelectVerified,
  onExpressSignatureInterest,
  verifiedPrice = "€19",
  signaturePrice = "€190",
}: PricingCardsSectionProps) {
  const { t } = useTranslation();

  return (
    <section id="pricing-section" className="py-20 lg:py-28">
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
            <div className="rounded-2xl p-8 h-full flex flex-col relative overflow-hidden bg-green-500/5 border-[2px] border-green-500/50 shadow-[0_0_32px_hsla(142,72%,40%,0.16)] hover:shadow-[0_0_48px_hsla(142,72%,40%,0.26)] hover:-translate-y-0.5 transition-all duration-300">

              {/* Recommended badge */}
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center rounded-full bg-green-500 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-green-600/20">
                  {t("pricingCards.recommended")}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-6">
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
                    {feature}
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

          {/* ── Signature (invitation only, dimmed) ── */}
          <m.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="h-full"
          >
            <div className="glass-box rounded-2xl p-8 h-full flex flex-col relative overflow-hidden opacity-60 border-border/30 transition-all duration-300">

              {/* Invitation Only badge */}
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted border border-border/50 text-muted-foreground px-3 py-1 text-[10px] font-semibold uppercase tracking-widest">
                  <Lock className="w-2.5 h-2.5" />
                  {t("pricingCards.byInvitation")}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-6">
                <Crown className="w-5 h-5 text-[#C7A35A]/60 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {t("pricingCards.signaturePartner")}
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground/50">{signaturePrice}</span>
                  <span className="text-muted-foreground/50 text-sm">{t("pricingCards.perMonth")}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {t("pricingCards.signatureDescription")}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {SIGNATURE_PARTNER_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-foreground/50">
                    <Check className="w-4 h-4 text-muted-foreground/40 shrink-0" strokeWidth={2.5} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled
                className="w-full rounded-lg border border-border/40 bg-muted/50 px-6 py-2.5 text-sm font-medium text-muted-foreground cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                {t("pricingCards.byInvitationOnly")}
              </button>

              <p className="text-xs text-center text-muted-foreground/60 mt-3">
                {t("pricingCards.eligiblePartnersContacted")}
              </p>
            </div>
          </m.div>
        </div>

        {/* Bottom note */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {t("pricingCards.interestedInSignature")}{" "}
            <button
              type="button"
              onClick={onExpressSignatureInterest}
              className="text-primary underline underline-offset-2 hover:text-primary/70 transition-colors"
            >
              {t("pricingCards.mentionInApplication")}
            </button>{" "}
            {t("pricingCards.reviewEligibilityNote")}
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
