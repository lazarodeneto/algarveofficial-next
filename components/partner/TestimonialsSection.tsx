"use client";

import { m } from "framer-motion";
import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  tier: "verified" | "signature";
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Within the first month, we had 14 direct inquiries from UK and German travelers that came directly from our AlgarveOfficial listing. The ROI is clear.",
    author: "Maria S.",
    role: "Owner, Boutique Hotel · Lagos",
    tier: "signature",
  },
  {
    quote:
      "We were skeptical at first. Three months in, our AlgarveOfficial profile drives more qualified leads than our own website. The audience quality is exceptional.",
    author: "João R.",
    role: "Director, Golf Resort · Vilamoura",
    tier: "signature",
  },
  {
    quote:
      "The Verified badge alone changed how travelers perceive us. We've seen a measurable uplift in direct booking inquiries since going live.",
    author: "Claire D.",
    role: "Manager, Restaurant · Albufeira",
    tier: "verified",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-24 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-title text-foreground">What partners say</h2>
          <p className="mt-4 text-muted-foreground">Results from verified AlgarveOfficial partners.</p>
        </m.div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <m.div
              key={t.author}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="h-full"
            >
              <Card
                className={cn(
                  "h-full glass-box transition-all duration-300",
                  t.tier === "signature" &&
                    "border-[hsl(43,86%,58%)] shadow-[0_0_24px_hsla(43,86%,58%,0.15)]"
                )}
              >
                <CardContent className="pt-6 flex flex-col h-full">
                  <Quote className="w-6 h-6 text-primary/35 mb-4 shrink-0" />
                  <p className="text-foreground/80 text-sm leading-relaxed flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-6 pt-4 border-t border-border/40">
                    <p className="text-sm font-semibold text-foreground">{t.author}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
