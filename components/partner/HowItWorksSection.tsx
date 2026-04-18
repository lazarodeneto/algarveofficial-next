"use client";

import { m } from "framer-motion";

const STEPS = [
  {
    number: "01",
    title: "Apply",
    description:
      "Fill in your business details in the form below. It takes less than 3 minutes. No commitment required.",
  },
  {
    number: "02",
    title: "Review",
    description:
      "Our curation team reviews your application within 2–3 business days and contacts you directly to discuss next steps.",
  },
  {
    number: "03",
    title: "Go Live",
    description:
      "Your listing is activated and immediately visible to 50,000+ monthly visitors. Start receiving inquiries.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 lg:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-title text-foreground">How it works</h2>
          <p className="mt-4 text-muted-foreground">Simple. Fast. No surprises.</p>
        </m.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connecting line — desktop only */}
          <div className="hidden md:block absolute top-10 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

          {STEPS.map((step, i) => (
            <m.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.14, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center relative"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-card border border-border/50 shadow-sm mb-6 relative z-10">
                <span className="font-serif text-2xl text-primary font-medium">{step.number}</span>
              </div>
              <h3 className="text-xl font-serif font-medium text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
