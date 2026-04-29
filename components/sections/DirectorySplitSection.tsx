"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLocalePath } from "@/hooks/useLocalePath";

export function DirectorySplitSection() {
  const l = useLocalePath();

  return (
    <section id="browse-all-listings" className="border-y border-border/60 bg-muted/20 py-14 sm:py-16">
      <div className="app-container content-max">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Full directory</p>
            <h2 className="mt-3 font-serif text-3xl font-medium text-foreground sm:text-4xl">
              Browse All Listings in the Algarve
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Looking for more options? Explore over 1,000 places across the Algarve.
            </p>
          </div>
          <Link href={l("/directory")} className="w-full md:w-auto">
            <Button size="lg" variant="luxury" className="w-full gap-2 md:w-auto">
              <Search className="h-4 w-4" />
              Browse All Listings
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
