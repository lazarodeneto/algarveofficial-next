"use client";

import { m } from "framer-motion";
import { Hotel, Utensils, Compass, Flag, Building2 } from "lucide-react";

const CATEGORIES = [
  { Icon: Hotel, label: "Hotels & Accommodation" },
  { Icon: Utensils, label: "Restaurants & Gastronomy" },
  { Icon: Compass, label: "Experiences & Activities" },
  { Icon: Flag, label: "Golf & Leisure" },
  { Icon: Building2, label: "Real Estate & Services" },
];

export function ForWhomSection() {
  return (
    <section className="py-20 lg:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-title text-foreground">Built for premium Algarve businesses</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
            AlgarveOfficial is not a mass directory. We curate established operators
            so every traveler finds exactly what they&apos;re looking for — and finds you.
          </p>
        </m.div>

        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.map(({ Icon, label }, i) => (
            <m.div
              key={label}
              initial={{ opacity: 0, scale: 0.93 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="glass-box flex items-center gap-2.5 px-5 py-3 rounded-full"
            >
              <Icon className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-medium text-foreground">{label}</span>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
