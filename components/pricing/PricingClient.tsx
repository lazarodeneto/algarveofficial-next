"use client";

import { m } from "framer-motion";
import { Crown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useSubscriptionPricing } from "@/hooks/useSubscriptionPricing";
import { PricingCardsSection } from "@/components/partner/PricingCardsSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function PricingClient() {
  const { t } = useTranslation();
  const l = useLocalePath();
  const router = useRouter();
  const { membershipTiers } = useSubscriptionPricing(t);
  const verifiedTier = membershipTiers.find((tier) => tier.id === "verified");
  const signatureTier = membershipTiers.find((tier) => tier.id === "signature");
  const verifiedPrice = verifiedTier?.monthly.display;
  const signaturePrice = signatureTier?.monthly.display;

  const faqs = [
    {
      q: t("pricing.faq.timing.q"),
      a: t(
        "pricing.faq.timing.a",
      ),
    },
    {
      q: t("pricing.faq.tierchange.q"),
      a: t(
        "pricing.faq.tierchange.a",
      ),
    },
    {
      q: t("pricing.faq.audience.q"),
      a: t(
        "pricing.faq.audience.a",
      ),
    },
    {
      q: t("pricing.faq.contract.q"),
      a: t(
        "pricing.faq.contract.a",
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
              {t("pricing.badge")}
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-medium text-foreground leading-tight">
              {t(
                "pricing.title",
              )}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t(
                "pricing.subtitle",
              )}
            </p>
          </m.div>
        </div>
      </section>

      {/* Pricing Tiers (shared with partner page) */}
      <PricingCardsSection
        verifiedPrice={verifiedPrice}
        signaturePrice={signaturePrice}
        onSelectVerified={() => router.push(l("/partner"))}
        onExpressSignatureInterest={() => router.push(l("/partner"))}
      />

      {/* FAQ */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-serif font-medium text-center mb-12">
              {t("pricing.faq.title")}
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="glass-box rounded-xl p-6">
                  <h3 className="text-base font-medium text-foreground mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </m.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Crown className="mx-auto h-10 w-10 text-primary mb-4" />
            <h2 className="text-3xl font-serif font-medium">
              {t("pricing.cta.title")}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {t(
                "pricing.cta.subtitle",
              )}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="hero" size="xl">
                <Link href={l("/partner")}>
                  {t("pricing.cta.primary")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="xl">
                <Link href={l("/contact")}>
                  {t("pricing.cta.secondary")}
                </Link>
              </Button>
            </div>
          </m.div>
        </div>
      </section>
    </div>
  );
}
