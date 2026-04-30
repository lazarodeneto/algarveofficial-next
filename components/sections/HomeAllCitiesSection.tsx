"use client";

import Link from "next/link";
import { ArrowRight, Crown } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useCities, useCityListingCounts } from "@/hooks/useReferenceData";

export function HomeAllCitiesSection() {
  const l = useLocalePath();
  const { data: cities = [], isLoading: citiesLoading } = useCities();
  const { data: cityCounts = {}, isLoading: countsLoading } = useCityListingCounts();

  const citiesWithListings = cities.filter((city) => (cityCounts[city.id] ?? 0) > 0);
  const isLoading = citiesLoading || countsLoading;

  if (!isLoading && citiesWithListings.length === 0) {
    return null;
  }

  return (
    <section id="home-all-cities" className="bg-card py-14 sm:py-20 lg:py-24">
      <div className="app-container content-max">
        <div className="mb-10 text-center sm:mb-12">
          <h2 className="font-serif text-3xl font-medium tracking-normal text-foreground sm:text-4xl">
            All Cities
          </h2>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Explore every city across the Algarve
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-[124px] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {citiesWithListings.map((city) => {
              const count = cityCounts[city.id] ?? 0;
              return (
                <Link
                  key={city.id}
                  href={l(`/destinations/${city.slug}`)}
                  className="group block rounded-2xl border border-border/70 bg-background p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="mb-4 flex items-center gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-primary transition-colors duration-300 ease-out group-hover:bg-primary/10">
                      <Crown className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate font-serif text-lg font-medium text-foreground transition-colors group-hover:text-primary">
                        {city.name}
                      </h3>
                      <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {count} {count === 1 ? "listing" : "listings"}
                      </p>
                    </div>
                  </div>
                  {city.short_description ? (
                    <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {city.short_description}
                    </p>
                  ) : null}
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex justify-center sm:mt-10">
          <Button variant="premium" size="lg" asChild>
            <Link href={l("/destinations")}>
              View all cities
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
