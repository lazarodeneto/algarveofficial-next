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
    <section id="home-smart-search" className="bg-background pb-12 pt-2 sm:pb-14 lg:pb-16">
      <div className="app-container content-max">
        <div className="grid gap-5 rounded-2xl border border-border/70 bg-card p-5 shadow-soft-surface sm:p-6 lg:grid-cols-[1fr_1.15fr_auto] lg:items-center lg:gap-7 lg:p-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {t("sections.homepage.smartSearch.label")}
            </p>
            <h2 className="mt-2 font-serif text-2xl font-medium leading-tight tracking-normal text-foreground sm:text-3xl">
              {t("sections.homepage.smartSearch.title")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t("sections.homepage.smartSearch.subtitle")}
            </p>
          </div>

          <div className="space-y-4">
            <nav aria-label={t("sections.homepage.smartSearch.intentLabel")} className="flex flex-wrap gap-2">
              {INTENTS.map((intent) => (
                <Link
                  key={intent.key}
                  href={l(intent.href)}
                  className="rounded-full border border-border/70 bg-background px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/45 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {t(`sections.homepage.smartSearch.intents.${intent.key}`)}
                </Link>
              ))}
            </nav>
            <nav aria-label={t("sections.homepage.smartSearch.cityLabel")} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 font-semibold text-muted-foreground">
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
            className={cn(buttonVariants({ variant: "gold", size: "lg" }), "w-full gap-2 lg:w-auto")}
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
