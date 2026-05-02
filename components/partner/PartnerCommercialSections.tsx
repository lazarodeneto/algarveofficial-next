"use client";

import { m } from "framer-motion";
import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Compass,
  Flag,
  Gem,
  Home,
  Map,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { LocaleLink } from "@/components/navigation/LocaleLink";

const AUDIENCE_ITEMS = [
  { key: "visitors", Icon: Compass },
  { key: "residents", Icon: Home },
  { key: "golf", Icon: Flag },
  { key: "property", Icon: Building2 },
  { key: "lifestyle", Icon: Gem },
] as const;

const PLACEMENT_ITEMS = [
  { key: "curated", Icon: Sparkles },
  { key: "relevance", Icon: Map },
  { key: "standards", Icon: ShieldCheck },
] as const;

const HUB_LINKS = [
  { key: "golf", href: "/golf", Icon: Flag },
  { key: "properties", href: "/properties", Icon: Building2 },
  { key: "relocation", href: "/relocation", Icon: Home },
  { key: "map", href: "/map", Icon: Map },
] as const;

export function PartnerCommercialSections() {
  const { t } = useTranslation();

  return (
    <>
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="mb-10 text-center"
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
              {t("partner.audience.badge")}
            </p>
            <h2 className="mt-3 text-title text-foreground">
              {t("partner.audience.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              {t("partner.audience.subtitle")}
            </p>
          </m.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {AUDIENCE_ITEMS.map(({ key, Icon }, index) => (
              <m.div
                key={key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04, duration: 0.4 }}
                className="glass-box rounded-sm p-5"
              >
                <Icon className="mb-4 h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  {t(`partner.audience.items.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`partner.audience.items.${key}.description`)}
                </p>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <m.div
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="self-center"
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
              {t("partner.placement.badge")}
            </p>
            <h2 className="mt-3 text-title text-foreground">
              {t("partner.placement.title")}
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {t("partner.placement.subtitle")}
            </p>
          </m.div>

          <div className="grid gap-4">
            {PLACEMENT_ITEMS.map(({ key, Icon }, index) => (
              <m.div
                key={key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="glass-box rounded-sm p-5"
              >
                <div className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {t(`partner.placement.items.${key}.title`)}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {t(`partner.placement.items.${key}.description`)}
                    </p>
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <m.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-lg border border-primary/20 bg-primary/5 p-6 sm:p-8"
            >
              <ShieldCheck className="mb-5 h-7 w-7 text-primary" />
              <h2 className="text-title text-foreground">
                {t("partner.trust.title")}
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {t("partner.trust.subtitle")}
              </p>
              <ul className="mt-6 space-y-3 text-sm text-foreground/80">
                {["review", "quality", "noGuarantees"].map((key) => (
                  <li key={key} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{t(`partner.trust.points.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="glass-box rounded-sm p-6 sm:p-8"
            >
              <Star className="mb-5 h-7 w-7 text-primary" />
              <h3 className="text-xl font-serif font-semibold text-foreground">
                {t("partner.hubLinks.title")}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t("partner.hubLinks.subtitle")}
              </p>
              <div className="mt-6 grid gap-3">
                {HUB_LINKS.map(({ key, href, Icon }) => (
                  <LocaleLink
                    key={key}
                    href={href}
                    className="flex items-center justify-between rounded-sm border border-border/60 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-primary" />
                      {t(`partner.hubLinks.links.${key}`)}
                    </span>
                    <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
                  </LocaleLink>
                ))}
              </div>
            </m.div>
          </div>
        </div>
      </section>
    </>
  );
}
