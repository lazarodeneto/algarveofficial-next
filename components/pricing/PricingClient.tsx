"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Sparkles, Crown, ArrowRight, Calculator } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useSubscriptionPricing } from "@/hooks/useSubscriptionPricing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PricingTier {
  id: string;
  name: string;
  badge: string;
  badgeVariant: "secondary" | "default" | "gold";
  badgeClass?: string;
  description: string;
  cta: string;
  ctaHref: string;
  features: { text: string; included: boolean }[];
  highlighted?: boolean;
  highlightLabel?: string;
}

export function PricingClient() {
  const { t } = useTranslation();
  const l = useLocalePath();
  const { membershipTiers } = useSubscriptionPricing(t);

  const [monthlyVisitors, setMonthlyVisitors] = useState(5000);
  const [conversionRate, setConversionRate] = useState(2);

  const inquiryValue = Math.round(monthlyVisitors * (conversionRate / 100));
  const signatureBoost = 1.8;
  const signatureInquiries = Math.round(inquiryValue * signatureBoost);

  const tiers: PricingTier[] = [
    {
      id: "verified",
      name: t("pricing.tiers.verified.name", "Verified Partner"),
      badge: t("pricing.tiers.verified.badge", "Recommended"),
      badgeVariant: "default",
      badgeClass: "bg-primary/15 text-primary border-primary/30",
      description: t(
        "pricing.tiers.verified.description",
        "Enhanced visibility and trust for established businesses.",
      ),
      cta: t("pricing.tiers.verified.cta", "Start Verified"),
      ctaHref: l("/partner"),
      features: [
        { text: t("pricing.feature.profile", "Enhanced business profile"), included: true },
        { text: t("pricing.feature.badge", "Verified trust badge"), included: true },
        { text: t("pricing.feature.map", "Map visibility priority"), included: true },
        { text: t("pricing.feature.directory", "Directory listings"), included: true },
        { text: t("pricing.feature.photos", "Up to 20 photos"), included: true },
        { text: t("pricing.feature.social", "Social media links"), included: true },
        { text: t("pricing.feature.whatsapp", "WhatsApp integration"), included: false },
        { text: t("pricing.feature.signature", "Signature Selection"), included: false },
        { text: t("pricing.feature.homepage", "Homepage featured"), included: false },
      ],
    },
    {
      id: "signature",
      name: t("pricing.tiers.signature.name", "Signature Partner"),
      badge: t("pricing.tiers.signature.badge", "Most Exclusive"),
      badgeVariant: "gold",
      badgeClass: "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/40 text-amber-400",
      description: t(
        "pricing.tiers.signature.description",
        "Maximum visibility, homepage placement, and exclusive partner benefits.",
      ),
      cta: t("pricing.tiers.signature.cta", "Apply for Signature"),
      ctaHref: l("/partner"),
      features: [
        { text: t("pricing.feature.profile", "Enhanced business profile"), included: true },
        { text: t("pricing.feature.badge", "Verified trust badge"), included: true },
        { text: t("pricing.feature.map", "Map visibility priority"), included: true },
        { text: t("pricing.feature.directory", "Directory listings"), included: true },
        { text: t("pricing.feature.photos", "Up to 50 photos"), included: true },
        { text: t("pricing.feature.social", "Social media links"), included: true },
        { text: t("pricing.feature.whatsapp", "WhatsApp integration"), included: true },
        { text: t("pricing.feature.signature", "Signature Selection eligibility"), included: true },
        { text: t("pricing.feature.homepage", "Homepage featured section"), included: true },
      ],
      highlighted: true,
      highlightLabel: t("pricing.tiers.signature.highlight", "Best ROI"),
    },
  ];

  const faqs = [
    {
      q: t("pricing.faq.timing.q", "How quickly will I see results?"),
      a: t(
        "pricing.faq.timing.a",
        "Most partners see increased inquiries within the first 30 days. Signature partners with homepage placement typically see results within the first week.",
      ),
    },
    {
      q: t("pricing.faq.tierchange.q", "Can I change tiers later?"),
      a: t(
        "pricing.faq.tierchange.a",
        "Yes. You can upgrade or downgrade your tier at any time. Changes take effect at the start of the next billing cycle.",
      ),
    },
    {
      q: t("pricing.faq.audience.q", "What kind of audience will my listing reach?"),
      a: t(
        "pricing.faq.audience.a",
        "Our audience is predominantly high-net-worth individuals, luxury travelers, and premium lifestyle buyers. 72% of visitors are from the UK, Germany, France, and Scandinavia.",
      ),
    },
    {
      q: t("pricing.faq.contract.q", "Is there a minimum contract?"),
      a: t(
        "pricing.faq.contract.a",
        "No long-term contracts required. All tiers are month-to-month. Annual billing is available at a 20% discount.",
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
              {t("pricing.badge", "Partnership Investment")}
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-medium text-foreground leading-tight">
              {t(
                "pricing.title",
                "Partner Investment",
              )}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t(
                "pricing.subtitle",
                "Transparent pricing for every stage of growth. From verified visibility to exclusive Signature placement.",
              )}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="pb-16 lg:pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass-box overflow-hidden">
              <CardHeader className="text-center pb-2">
                <Calculator className="mx-auto h-8 w-8 text-primary mb-3" />
                <CardTitle className="text-2xl font-serif">
                  {t("pricing.calculator.title", "Estimate Your Visibility")}
                </CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(
                    "pricing.calculator.subtitle",
                    "See how AlgarveOfficial drives qualified inquiries to your business.",
                  )}
                </p>
              </CardHeader>
              <CardContent className="space-y-8 pt-4">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">
                      {t("pricing.calculator.visitors", "Monthly Platform Visitors")}:{" "}
                      <span className="text-primary font-semibold">{monthlyVisitors.toLocaleString()}</span>
                    </label>
                    <input
                      type="range"
                      min={1000}
                      max={50000}
                      step={500}
                      value={monthlyVisitors}
                      onChange={(e) => setMonthlyVisitors(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1K</span>
                      <span>50K</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium">
                      {t("pricing.calculator.conversion", "Conversion Rate")}:{" "}
                      <span className="text-primary font-semibold">{conversionRate}%</span>
                    </label>
                    <input
                      type="range"
                      min={0.5}
                      max={10}
                      step={0.5}
                      value={conversionRate}
                      onChange={(e) => setConversionRate(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.5%</span>
                      <span>10%</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-6">
                  <div className="grid sm:grid-cols-3 gap-6 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {t("pricing.calculator.verifiedInquiries", "Verified Inquiries")}
                      </p>
                      <p className="text-3xl font-serif font-medium text-foreground">
                        ~{inquiryValue.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("pricing.calculator.perMonth", "/month")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {t("pricing.calculator.signatureInquiries", "Signature Inquiries")}
                      </p>
                      <p className="text-3xl font-serif font-medium text-primary">
                        ~{signatureInquiries.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("pricing.calculator.perMonth", "/month")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {t("pricing.calculator.inquiryValue", "Est. Inquiry Value")}
                      </p>
                      <p className="text-3xl font-serif font-medium text-foreground">
                        €{Math.round(inquiryValue * 150).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("pricing.calculator.perMonth", "/month")}
                      </p>
                    </div>
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-4">
                    {t(
                      "pricing.calculator.disclaimer",
                      "Estimates based on average platform conversion rates. Actual results vary.",
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="pb-16 lg:pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {tiers.map((tier, index) => (
              (() => {
                const dynamicTier = membershipTiers.find((candidate) => candidate.id === tier.id);
                const monthlyPrice = dynamicTier?.monthly.display || t("pricing.unavailable", "Contact us");
                const monthlyNote = dynamicTier?.monthly.note || t("pricing.unavailableNote", "Pricing available on request");
                const annualLine = dynamicTier?.annual
                  ? `${t("admin.subscriptions.billing.annual", "Annual")}: ${dynamicTier.annual.display} (${dynamicTier.annual.note})`
                  : null;
                const promoLine = dynamicTier?.promo
                  ? `${t("admin.subscriptions.billing.period", "Promo")}: ${dynamicTier.promo.display} (${dynamicTier.promo.note})`
                  : null;
                return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={tier.highlighted ? "relative" : ""}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black border-0 px-4 py-1 text-xs font-bold shadow-lg">
                      <Sparkles className="inline h-3 w-3 mr-1" />
                      {tier.highlightLabel}
                    </Badge>
                  </div>
                )}
                <Card
                  className={`glass-box h-full ${tier.highlighted ? "border-primary/40 shadow-[0_0_30px_rgba(207,164,58,0.15)]" : ""}`}
                >
                  <CardHeader className="text-center pb-4">
                    <Badge className={`mb-4 ${tier.badgeClass}`}>
                      {tier.badge}
                    </Badge>
                    <CardTitle className="text-xl font-serif">{tier.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-serif font-medium text-foreground">{monthlyPrice}</span>
                      <p className="text-sm text-muted-foreground mt-1">{monthlyNote}</p>
                      {annualLine && (
                        <p className="text-xs text-muted-foreground mt-2">{annualLine}</p>
                      )}
                      {promoLine && (
                        <p className="text-xs text-primary mt-1">{promoLine}</p>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{tier.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          {feature.included ? (
                            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/40 mt-0.5 flex-shrink-0" />
                          )}
                          <span className={feature.included ? "text-foreground" : "text-muted-foreground/60"}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      variant={tier.highlighted ? "hero" : "secondary"}
                      size="lg"
                      className="w-full mt-6"
                    >
                      <Link href={tier.ctaHref}>
                        {tier.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
                );
              })()
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            {t(
              "pricing.tiers.note",
              "All prices exclude VAT. Custom enterprise pricing available on request.",
            )}{" "}
            <Link href={l("/contact")} className="text-primary hover:underline">
              {t("pricing.tiers.contact", "Contact us")}
            </Link>{" "}
            {t("pricing.tiers.forEnterprise", "for enterprise partnerships.")}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-serif font-medium text-center mb-12">
              {t("pricing.faq.title", "Frequently Asked Questions")}
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="glass-box rounded-xl p-6">
                  <h3 className="text-base font-medium text-foreground mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Crown className="mx-auto h-10 w-10 text-primary mb-4" />
            <h2 className="text-3xl font-serif font-medium">
              {t("pricing.cta.title", "Ready to grow your presence in the Algarve?")}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {t(
                "pricing.cta.subtitle",
                "Apply today and our team will review your application within 2-3 business days.",
              )}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="hero" size="xl">
                <Link href={l("/partner")}>
                  {t("pricing.cta.primary", "Apply Now")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="xl">
                <Link href={l("/contact")}>
                  {t("pricing.cta.secondary", "Contact Us")}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
