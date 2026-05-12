import { ArrowRight, Building2, Search, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import Image from "next/image";
import { useLocalePath } from "@/hooks/useLocalePath";
import { cmsText, isSafeHomeCtaHref, type HomeSectionCopy } from "@/lib/cms/home-section-copy";

export function CTASection({
  copy,
  listingCount,
}: {
  copy?: HomeSectionCopy;
  listingCount?: number;
} = {}) {
  const { t } = useTranslation();
  const l = useLocalePath();
  const primaryHref = isSafeHomeCtaHref(copy?.ctaHref) && copy?.ctaHref?.trim()
    ? copy.ctaHref.trim()
    : "/directory";
  const secondaryHref = isSafeHomeCtaHref(copy?.secondaryCtaHref) && copy?.secondaryCtaHref?.trim()
    ? copy.secondaryCtaHref.trim()
    : "/partner";

  return (
    <section className="bg-background py-16 sm:py-20 lg:py-24">
      <div className="app-container content-max">
        <div className="grid overflow-hidden rounded-lg border border-border/70 bg-card text-card-foreground shadow-soft-surface transition-all duration-300 ease-out motion-reduce:transition-none hover:shadow-card-hover dark:border-white/12 dark:bg-[hsl(var(--card)/0.92)] lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left: text panel */}
          <div className="flex flex-col justify-center p-6 text-center sm:p-8 lg:p-12 lg:text-left">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary lg:mx-0">
              <Building2 className="h-4 w-4" strokeWidth={1.8} />
              {cmsText(copy?.eyebrow, t("sections.homepage.cta.label"))}
            </div>

            <h2 className="mx-auto max-w-xl font-serif text-3xl font-medium leading-tight tracking-normal text-foreground sm:text-4xl lg:mx-0 lg:text-[2.5rem]">
              {cmsText(copy?.title, t("sections.homepage.cta.title"))}
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
              {cmsText(copy?.subtitle ?? copy?.description, t("sections.homepage.cta.subtitle"))}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                href={`${l("/")}#signature-collection`}
                className="group rounded-sm border border-border/70 bg-background/80 p-4 text-left transition-all duration-200 hover:border-primary/45 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 dark:border-white/[0.14] dark:bg-white/[0.08] dark:hover:bg-primary/10"
              >
                <UserRound className="mx-auto h-5 w-5 text-primary lg:mx-0" strokeWidth={1.8} />
                <h3 className="mt-3 text-sm font-semibold text-foreground">
                  {t("sections.homepage.cta.visitorTitle")}
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {t("sections.homepage.cta.visitorText")}
                </p>
              </Link>
              <Link
                href={l("/partner")}
                className="group rounded-sm border border-border/70 bg-background/80 p-4 text-left transition-all duration-200 hover:border-primary/45 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 dark:border-white/[0.14] dark:bg-white/[0.08] dark:hover:bg-primary/10"
              >
                <Building2 className="mx-auto h-5 w-5 text-primary lg:mx-0" strokeWidth={1.8} />
                <h3 className="mt-3 text-sm font-semibold text-foreground">
                  {t("sections.homepage.cta.businessTitle")}
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {t("sections.homepage.cta.businessText")}
                </p>
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Button variant="primary" size="lg" className="min-h-11 w-full gap-2 px-6" asChild>
                <Link href={l(primaryHref)}>
                  <Search className="mr-1.5 h-4 w-4" strokeWidth={1.8} />
                  {cmsText(copy?.ctaLabel, t("sections.homepage.cta.primaryButton"))}
                  <ArrowRight className="ml-1.5 h-4 w-4" strokeWidth={1.8} />
                </Link>
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="min-h-11 w-full px-6"
                asChild
              >
                <Link href={l(secondaryHref)}>
                  <Building2 className="mr-1.5 h-4 w-4" strokeWidth={1.8} />
                  {cmsText(copy?.secondaryCtaLabel, t("sections.homepage.cta.secondaryButton"))}
                </Link>
              </Button>
            </div>

            {/* Micro trust line */}
            <p className="mt-6 text-sm text-muted-foreground">
              {typeof listingCount === "number" && listingCount > 0
                ? t("sections.homepage.cta.stats", { count: listingCount })
                : t("sections.homepage.cta.emptyStats")}
            </p>
          </div>

          {/* Right: image panel */}
          <div className="relative min-h-[240px] overflow-hidden sm:min-h-[300px] lg:min-h-full" aria-hidden="true">
            <Image
              src="/images/home/algarveofficial-join.webp"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              quality={56}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-card/70 via-card/25 to-transparent dark:from-card/72 dark:via-card/20 lg:from-card/45 dark:lg:from-card/62" />
            <div className="absolute inset-0 bg-gradient-to-t from-card/45 to-transparent dark:from-card/72 lg:hidden" />
          </div>
        </div>
      </div>
    </section>
  );
}
