"use client";

import { m } from "framer-motion";

const STATS = [
  { value: "200+", label: "Partner businesses" },
  { value: "50k+", label: "Monthly visitors" },
  { value: "72%", label: "UK, DE & Scandinavia" },
  { value: "30 days", label: "To first inquiries" },
];

export function SocialProofBar() {
  return (
    <section className="border-y border-border/40 bg-card/60 backdrop-blur-sm py-7">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-10 lg:gap-16">
          {STATS.map((stat, i) => (
            <m.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="text-center"
            >
              <div className="text-2xl font-bold text-primary tracking-tight">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5 tracking-wide uppercase">{stat.label}</div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
