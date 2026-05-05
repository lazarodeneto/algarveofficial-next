"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Search } from "lucide-react";

import { buttonVariants } from "@/components/ui/Button";
import { useLocalePath } from "@/hooks/useLocalePath";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const INTENTS = [
  { key: "stay", href: "/visit/albufeira/accommodation" },
  { key: "eatDrink", href: "/visit/lagos/restaurants" },
  { key: "thingsToDo", href: "/directory?category=things-to-do" },
  { key: "golf", href: "/visit/vilamoura/golf" },
  { key: "realEstate", href: "/real-estate" },
  { key: "relocation", href: "/relocation", labelKey: "nav.relocation" },
  { key: "events", href: "/events" },
] as const;

const CITIES = [
  { key: "lagos", href: "/visit/lagos" },
  { key: "vilamoura", href: "/visit/vilamoura" },
  { key: "albufeira", href: "/visit/albufeira" },
  { key: "tavira", href: "/visit/tavira" },
  { key: "carvoeiro", href: "/visit/carvoeiro" },
  { key: "quintaDoLago", href: "/visit/quinta-do-lago" },
] as const;

export function HomeSmartSearchSection() {
  const l = useLocalePath();
  const { t } = useTranslation();

  return (
    <section id="home-smart-search" className="relative z-20 bg-background pb-8 pt-5 sm:pb-10 lg:pb-12">
      <div className="app-container content-max">
        <div className="grid gap-5 rounded-sm border border-primary/20 bg-card p-5 text-center shadow-[0_18px_60px_rgba(17,24,39,0.10)] sm:p-6 lg:grid-cols-[1fr_1.15fr_auto] lg:items-center lg:gap-7 lg:p-7 lg:text-left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {t("sections.homepage.smartSearch.label")}
            </p>
            <h2 className="mt-2 font-serif text-2xl font-medium leading-tight tracking-normal text-foreground sm:text-3xl">
              {t("sections.homepage.smartSearch.title")}
            </h2>
            <p className="mx-auto mt-2 max-w-[28rem] text-sm leading-6 text-muted-foreground lg:mx-0">
              {t("sections.homepage.smartSearch.subtitle")}
            </p>
          </div>

          <div className="space-y-4">
            <nav aria-label={t("sections.homepage.smartSearch.intentLabel")} className="flex flex-wrap justify-center gap-2 lg:justify-start">
              {INTENTS.map((intent) => (
                (() => {
                  const labelKey =
                    "labelKey" in intent
                      ? intent.labelKey
                      : `sections.homepage.smartSearch.intents.${intent.key}`;

                  return (
                    <Link
                      key={intent.key}
                      href={l(intent.href)}
                      className="rounded-full border border-border/70 bg-background px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/45 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {t(labelKey)}
                    </Link>
                  );
                })()
              ))}
            </nav>
            <nav aria-label={t("sections.homepage.smartSearch.cityLabel")} className="flex flex-wrap items-center justify-center gap-2 text-sm lg:justify-start">
              <span className="inline-flex w-full items-center justify-center gap-1.5 font-semibold text-muted-foreground sm:w-auto lg:justify-start">
                <MapPin className="h-4 w-4 text-primary" />
                {t("sections.homepage.smartSearch.popularCities")}
              </span>
              {CITIES.map((city) => (
                <Link
                  key={city.key}
                  href={l(city.href)}
                  className="text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  {t(`sections.homepage.smartSearch.cities.${city.key}`)}
                </Link>
              ))}
            </nav>
          </div>

          <Link
            href={l("/directory")}
            className={cn(buttonVariants({ variant: "gold", size: "lg" }), "mx-auto w-full gap-2 sm:w-auto lg:mx-0")}
          >
            <Search className="h-4 w-4" />
            {t("sections.homepage.smartSearch.cta")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
