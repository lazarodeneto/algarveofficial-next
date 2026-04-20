"use client";

import { m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, BadgeEuro } from "lucide-react";

interface FinalCTASectionProps {
  onApplyFree: () => void;
  onBuySubscription: () => void;
}

export function FinalCTASection({ onApplyFree, onBuySubscription }: FinalCTASectionProps) {
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
            Ready to grow your presence in the Algarve?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Apply today. Our team reviews within 2–3 business days and reaches out to discuss
            your goals and the right partnership level.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button variant="outline" size="xl" onClick={onApplyFree} className="w-full sm:w-auto gap-2">
              Apply (Free)
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="gold" size="xl" onClick={onBuySubscription} className="w-full sm:w-auto gap-2 shadow-xl">
              Buy Subscription
              <BadgeEuro className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground/60 tracking-wide">
            ✓ No long-term contract &nbsp;·&nbsp; ✓ Cancel anytime &nbsp;·&nbsp; ✓ 2–3 day review
          </p>
        </m.div>
      </div>
    </section>
  );
}
