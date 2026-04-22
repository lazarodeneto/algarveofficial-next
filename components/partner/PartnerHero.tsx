"use client";

import { m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PartnerHeroProps {
  title: string;
  subtitle: string;
  onApply: () => void;
}

export function PartnerHero({ title, subtitle, onApply }: PartnerHeroProps) {
  const { t } = useTranslation();

  const scrollToPricing = () => {
    document.getElementById("pricing-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden pt-24 pb-14 sm:pt-28 sm:pb-20 lg:pt-36 lg:pb-28">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-primary/3 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <m.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-7"
        >
          <Badge variant="gold" className="mb-2 text-[11px] tracking-[0.18em] uppercase px-4 py-1.5">
            {t("partner.hero.badge")}
          </Badge>

          <h1 className="text-hero text-foreground max-w-4xl mx-auto">
            {title}
          </h1>

          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          <p className="text-sm text-muted-foreground/60 tracking-wide">
            {t("partner.hero.trustLine")}
          </p>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center sm:gap-4">
            <Button
              variant="gold"
              size="xl"
              onClick={onApply}
              className="w-full sm:min-w-[220px] sm:w-auto shadow-xl"
            >
              {t("partner.hero.applyForPartnership")}
            </Button>
            <Button
              variant="outline"
              size="xl"
              onClick={scrollToPricing}
              className="w-full sm:min-w-[160px] sm:w-auto"
            >
              {t("partner.hero.viewPricing")}
            </Button>
          </div>
        </m.div>
      </div>

      <m.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <ChevronDown className="w-5 h-5 text-muted-foreground/30" />
      </m.div>
    </section>
  );
}
