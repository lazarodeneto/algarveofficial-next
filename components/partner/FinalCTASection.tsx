"use client";

import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowRight, BadgeEuro } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FinalCTASectionProps {
  onApplyFree: () => void;
  onBuySubscription: () => void;
}

export function FinalCTASection({ onApplyFree, onBuySubscription }: FinalCTASectionProps) {
  const { t } = useTranslation();

  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <m.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <h2 className="text-title text-foreground">
            {t("pricing.cta.title")}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t("pricing.cta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button variant="outline" size="xl" onClick={onApplyFree} className="w-full sm:w-auto gap-2">
              {t("partner.finalCta.applyFree")}
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="gold" size="xl" onClick={onBuySubscription} className="w-full sm:w-auto gap-2 shadow-xl">
              {t("partner.finalCta.buySubscription")}
              <BadgeEuro className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground/60 tracking-wide">
            {t("partner.finalCta.trustLine")}
          </p>
        </m.div>
      </div>
    </section>
  );
}
