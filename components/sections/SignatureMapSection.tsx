"use client";

import Link from "next/link";
import { ArrowRight, MapPinned, Search } from "lucide-react";

import { buttonVariants } from "@/components/ui/Button";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useSignatureListings } from "@/hooks/useListings";
import { useTranslation } from "react-i18next";

export function SignatureMapSection() {
  const l = useLocalePath();
  const { t } = useTranslation();
  const { data: signatureListings = [] } = useSignatureListings();
  const mappedCount = signatureListings.filter((listing) => {
    const latitude = Number(listing.latitude ?? listing.city?.latitude ?? NaN);
    const longitude = Number(listing.longitude ?? listing.city?.longitude ?? NaN);
    return Number.isFinite(latitude) && Number.isFinite(longitude);
  }).length;
  const displayCount = mappedCount > 0 ? mappedCount : 200;

  return (
    <section id="explore-map" className="bg-background py-14 sm:py-16 lg:py-20">
      <div className="app-container content-max">
        <Link
          href={l("/map")}
          className="group relative isolate block overflow-hidden rounded-2xl border border-border/70 bg-[#10281f] shadow-card transition-all duration-300 ease-out motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="absolute inset-0 opacity-90" aria-hidden="true">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_30%,rgba(212,166,42,0.2),transparent_18%),linear-gradient(135deg,rgba(255,255,255,0.06)_0_1px,transparent_1px_42px)]" />
            <div className="absolute left-[16%] top-[22%] h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_0_8px_rgba(212,166,42,0.16)]" />
            <div className="absolute left-[53%] top-[48%] h-2.5 w-2.5 rounded-full bg-white/85 shadow-[0_0_0_8px_rgba(255,255,255,0.12)]" />
            <div className="absolute right-[20%] top-[30%] h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_0_8px_rgba(212,166,42,0.16)]" />
            <div className="absolute bottom-[25%] left-[38%] h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_0_8px_rgba(212,166,42,0.14)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#10281f] via-[#10281f]/88 to-[#10281f]/56" />
          </div>

          <div className="relative z-10 grid min-h-[220px] gap-6 p-6 sm:min-h-[260px] sm:gap-8 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end lg:p-10">
            <div className="max-w-2xl text-white">
              <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                <MapPinned className="h-4 w-4" />
                {t("sections.homepage.signatureMap.label")}
              </span>
              <h2 className="mt-4 font-serif text-3xl font-medium tracking-normal sm:text-4xl">
                {t("sections.homepage.signatureMap.title")}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/78 sm:text-lg">
                {t("sections.homepage.signatureMap.subtitle", { count: displayCount })}
              </p>
            </div>

            <span className={buttonVariants({ variant: "gold", size: "lg", className: "w-full gap-2 sm:w-auto" })}>
              <Search className="h-4 w-4" />
              {t("sections.homepage.signatureMap.cta")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}

export default SignatureMapSection;
