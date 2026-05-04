"use client";

import Link from "next/link";
import { ArrowRight, Building2, Map, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { buttonVariants } from "@/components/ui/Button";
import { useLocalePath } from "@/hooks/useLocalePath";
import { cn } from "@/lib/utils";

export function HomeFinalEndcap() {
  const { t } = useTranslation();
  const l = useLocalePath();

  return (
    <section className="bg-background pb-14 pt-4 sm:pb-18 lg:pb-20">
      <div className="app-container content-max">
        <div className="rounded-sm border border-border/70 bg-card px-5 py-7 text-center shadow-soft-surface sm:px-8 sm:py-9">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {t("sections.homepage.hero.label")}
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl font-serif text-2xl font-medium leading-tight tracking-normal text-foreground sm:text-3xl">
            {t("sections.homepage.smartSearch.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {t("sections.homepage.smartSearch.subtitle")}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={l("/directory")}
              className={cn(buttonVariants({ variant: "gold", size: "lg" }), "gap-2")}
            >
              <Search className="h-4 w-4" />
              {t("sections.homepage.smartSearch.cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={l("/map")}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}
            >
              <Map className="h-4 w-4" />
              {t("sections.homepage.signatureMap.cta")}
            </Link>
            <Link
              href={l("/partner")}
              className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "gap-2")}
            >
              <Building2 className="h-4 w-4" />
              {t("sections.homepage.cta.secondaryButton")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
