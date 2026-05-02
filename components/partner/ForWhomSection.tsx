"use client";

import { m } from "framer-motion";
import { Hotel, Utensils, Compass, Flag, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const CATEGORIES = [
  { Icon: Hotel, key: "hotels" },
  { Icon: Utensils, key: "restaurants" },
  { Icon: Compass, key: "experiences" },
  { Icon: Flag, key: "golf" },
  { Icon: Building2, key: "realEstate" },
];

export function ForWhomSection() {
  const { t } = useTranslation();

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
          <h2 className="text-title text-foreground">{t("partner.forWhom.title")}</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t("partner.forWhom.subtitle")}
          </p>
        </m.div>

        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.map(({ Icon, key }, i) => (
            <m.div
              key={key}
              initial={{ opacity: 0, scale: 0.93 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="glass-box flex items-center gap-2.5 px-5 py-3 rounded-full"
            >
              <Icon className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-medium text-foreground">{t(`partner.forWhom.categories.${key}`)}</span>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
