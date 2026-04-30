import { ArrowRight, Building2, Search } from "lucide-react";
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
    <section className="relative overflow-hidden bg-background py-14 sm:py-20 lg:py-24">
      <div className="app-container content-max">
        <div className="grid overflow-hidden rounded-2xl bg-muted/25 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-6 sm:p-8 lg:p-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            <Building2 className="h-4 w-4" />
            Join our community
          </div>

          <h2 className="max-w-2xl font-serif text-3xl font-medium leading-tight text-foreground sm:text-4xl lg:text-5xl">
            Join the AlgarveOfficial platform
          </h2>

          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Browse curated places across the Algarve, or bring your premium business into a platform built for discovery.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button variant="hero" size="lg" asChild>
              <Link href={l("/directory")}>
                <Search className="mr-2 h-4 w-4" />
                Explore Listings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="heroOutline"
              size="lg"
              className="bg-white text-[rgba(11,31,58,0.92)] border-[rgba(11,31,58,0.12)] hover:bg-white hover:text-[rgba(11,31,58,0.98)]"
              asChild
            >
              <Link href={l("/partner")}>
                List Your Business
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            {listingCount > 0 ? t('sections.cta.stats', { count: listingCount }) : "Curated places, regional guides and trusted local discovery."}
          </p>
          </div>
          <div
            className="relative hidden min-h-[320px] bg-cover bg-center lg:block"
            style={{ backgroundImage: "url('/images/region-tavira-800w-BTeay4E1.webp')" }}
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-muted/20 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
