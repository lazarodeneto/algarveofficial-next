"use client";

import { m } from "framer-motion";
import { Check, Minus, Crown, ShieldCheck, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Feature {
  label: string;
  free: boolean;
  verified: boolean;
  signature: boolean;
}

const FEATURES: Feature[] = [
  { label: "Directory listing",              free: true,  verified: true,  signature: true  },
  { label: "Map visibility",                 free: true,  verified: true,  signature: true  },
  { label: "Basic business profile",         free: true,  verified: true,  signature: true  },
  { label: "Verified trust badge",           free: false, verified: true,  signature: true  },
  { label: "Enhanced business profile",      free: false, verified: true,  signature: true  },
  { label: "Photo gallery (20+ images)",     free: false, verified: true,  signature: true  },
  { label: "Social media links",             free: false, verified: true,  signature: true  },
  { label: "Direct contact from travelers",  free: false, verified: true,  signature: true  },
  { label: "Map priority placement",         free: false, verified: true,  signature: true  },
  { label: "Homepage featured placement",    free: false, verified: false, signature: true  },
  { label: "Signature Selection eligibility",free: false, verified: false, signature: true  },
  { label: "WhatsApp integration",           free: false, verified: false, signature: true  },
  { label: "Priority curation support",      free: false, verified: false, signature: true  },
];

function Cell({ value }: { value: boolean }) {
  return value ? (
    <Check className="w-4 h-4 text-primary mx-auto" strokeWidth={2.5} />
  ) : (
    <Minus className="w-3.5 h-3.5 text-muted-foreground/25 mx-auto" />
  );
}

export function PricingFeaturesTable({ verifiedPrice = "€19" }: { verifiedPrice?: string }) {
  return (
    <section className="py-20 lg:py-24 bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-title text-foreground">What&apos;s included in each tier</h2>
          <p className="mt-4 text-muted-foreground">
            Compare features across all three partnership levels.
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="glass-box rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left py-5 px-6 text-sm font-medium text-muted-foreground w-[46%]">
                    Feature
                  </th>

                  <th className="py-5 px-4 text-center min-w-[90px]">
                    <div className="text-sm font-semibold text-muted-foreground">Free</div>
                    <div className="text-xs text-muted-foreground/50 mt-0.5">Basic</div>
                  </th>

                  <th className="py-5 px-4 text-center min-w-[110px]">
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-sm font-semibold text-foreground">Verified</span>
                    </div>
                    <div className="text-xs text-primary font-semibold">{verifiedPrice}/month</div>
                  </th>

                  <th className="py-5 px-4 text-center min-w-[120px] opacity-50">
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <Crown className="w-3.5 h-3.5 text-[#C7A35A]" />
                      <span className="text-sm font-semibold text-foreground">Signature</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-muted-foreground mt-0.5">
                      <Lock className="w-2.5 h-2.5" />
                      By invitation
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {FEATURES.map((feature, i) => (
                  <tr
                    key={feature.label}
                    className={cn(
                      "border-b border-border/25 last:border-0 transition-colors",
                      i % 2 !== 0 && "bg-muted/20"
                    )}
                  >
                    <td className="py-3.5 px-6 text-sm text-foreground/75">{feature.label}</td>
                    <td className="py-3.5 px-4 text-center"><Cell value={feature.free} /></td>
                    <td className="py-3.5 px-4 text-center"><Cell value={feature.verified} /></td>
                    <td className="py-3.5 px-4 text-center opacity-40"><Cell value={feature.signature} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </m.div>
      </div>
    </section>
  );
}
