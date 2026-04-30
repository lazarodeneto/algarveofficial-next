"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPinned } from "lucide-react";

import { buttonVariants } from "@/components/ui/Button";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useTranslation } from "react-i18next";

function AlgarveMapIllustration({ alt }: { alt: string }) {
  return (
    <div className="relative aspect-[1.95/1] min-h-[220px] overflow-hidden rounded-2xl bg-[#fffaf1] sm:min-h-[260px] lg:h-full lg:min-h-0 lg:rounded-none">
      <Image
        src="/images/home/map-gateway.png"
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 58vw"
        quality={90}
        className="object-contain object-center"
      />
    </div>
  );
}

export function SignatureMapSection() {
  const l = useLocalePath();
  const { t } = useTranslation();

  return (
    <section id="explore-map" className="bg-background py-14 sm:py-16 lg:py-20">
      <div className="app-container content-max">
        <Link
          href={l("/map")}
          aria-label={t("sections.homepage.mapGateway.ariaLabel")}
          className="group grid overflow-hidden rounded-[1.75rem] border border-[#d9a21b]/25 bg-[#fffdf8] shadow-[0_22px_70px_-48px_rgba(15,45,36,0.45)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none lg:grid-cols-[0.62fr_1.38fr]"
        >
          <div className="flex max-w-md flex-col justify-center p-6 sm:p-8 lg:p-8 xl:p-9">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <MapPinned className="h-4 w-4" strokeWidth={1.8} />
              {t("sections.homepage.mapGateway.eyebrow")}
            </span>
            <h2 className="mt-4 max-w-[13ch] font-serif text-3xl font-medium leading-[1.02] tracking-normal text-[#0F2D24] sm:text-4xl lg:text-[2.65rem] xl:text-[3rem]">
              {t("sections.homepage.mapGateway.title")}
            </h2>
            <p className="mt-4 max-w-[28rem] text-sm leading-6 text-muted-foreground sm:text-base">
              {t("sections.homepage.mapGateway.subtitle")}
            </p>
            <div className="mt-6">
              <span
                className={buttonVariants({ variant: "gold", size: "lg", className: "w-full gap-2 sm:w-auto" })}
              >
                {t("sections.homepage.mapGateway.cta")}
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>

          <div className="border-t border-[#d9a21b]/15 lg:border-l lg:border-t-0">
            <AlgarveMapIllustration alt={t("sections.homepage.mapGateway.illustrationLabel")} />
          </div>
        </Link>
      </div>
    </section>
  );
}

export default SignatureMapSection;
