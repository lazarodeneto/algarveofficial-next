import { ArrowRight, Building2, Search, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useLocalePath } from "@/hooks/useLocalePath";
import { usePublishedListings } from "@/hooks/useListings";

export function CTASection() {
  const { t } = useTranslation();
  const l = useLocalePath();
  const { data: listings } = usePublishedListings();
  const listingCount = listings?.length ?? 0;

  return (
    <section className="bg-background py-16 sm:py-20 lg:py-24">
      <div className="app-container content-max">
        <div className="grid overflow-hidden rounded-2xl border border-black/5 bg-white shadow-soft-surface transition-all duration-300 ease-out motion-reduce:transition-none hover:shadow-card-hover lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left: text panel */}
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-12">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              <Building2 className="h-4 w-4" strokeWidth={1.8} />
              {t("sections.homepage.cta.label")}
            </div>

            <h2 className="max-w-xl font-serif text-3xl font-medium leading-tight tracking-normal text-foreground sm:text-4xl lg:text-[2.5rem]">
              {t("sections.homepage.cta.title")}
            </h2>

            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("sections.homepage.cta.subtitle")}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                <UserRound className="h-5 w-5 text-primary" strokeWidth={1.8} />
                <h3 className="mt-3 text-sm font-semibold text-foreground">
                  {t("sections.homepage.cta.visitorTitle")}
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {t("sections.homepage.cta.visitorText")}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                <Building2 className="h-5 w-5 text-primary" strokeWidth={1.8} />
                <h3 className="mt-3 text-sm font-semibold text-foreground">
                  {t("sections.homepage.cta.businessTitle")}
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {t("sections.homepage.cta.businessText")}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button variant="primary" size="lg" className="min-h-11 w-full gap-2 px-6 sm:w-auto" asChild>
                <Link href={l("/directory")}>
                  <Search className="mr-1.5 h-4 w-4" strokeWidth={1.8} />
                  {t("sections.homepage.cta.primaryButton")}
                  <ArrowRight className="ml-1.5 h-4 w-4" strokeWidth={1.8} />
                </Link>
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="min-h-11 w-full px-6 sm:w-auto"
                asChild
              >
                <Link href={l("/partner")}>
                  {t("sections.homepage.cta.secondaryButton")}
                </Link>
              </Button>
            </div>

            {/* Micro trust line */}
            <p className="mt-6 text-sm text-muted-foreground">
              {listingCount > 0
                ? t("sections.homepage.cta.stats", { count: listingCount })
                : t("sections.homepage.cta.emptyStats")}
            </p>
          </div>

          {/* Right: image panel */}
          <div
            className="relative min-h-[240px] bg-cover bg-center sm:min-h-[300px] lg:min-h-full"
            style={{
              backgroundImage:
                "url('/images/region-tavira-800w-BTeay4E1.webp')",
            }}
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/20 to-transparent lg:from-white/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent lg:hidden" />
          </div>
        </div>
      </div>
    </section>
  );
}
