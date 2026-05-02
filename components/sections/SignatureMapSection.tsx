"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPinned } from "lucide-react";

import { buttonVariants } from "@/components/ui/Button";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useTranslation } from "react-i18next";
import { cmsText, isSafeHomeCtaHref, type HomeSectionCopy } from "@/lib/cms/home-section-copy";

function AlgarveMapIllustration({ alt }: { alt: string }) {
  return (
    <div className="flex min-w-0 min-h-[220px] items-center justify-center overflow-hidden rounded-md bg-[#fffaf1] px-3 py-4 sm:min-h-[260px] sm:px-4 lg:h-full lg:min-h-0 lg:rounded-none lg:px-6 xl:px-8">
      <Image
        src="/images/home/map-gateway.png"
        alt={alt}
        width={1015}
        height={529}
        sizes="(max-width: 1024px) 100vw, 58vw"
        quality={80}
        className="h-auto w-full max-w-full object-contain"
      />
    </div>
  );
}

export function SignatureMapSection({ copy }: { copy?: HomeSectionCopy } = {}) {
  const l = useLocalePath();
  const { t } = useTranslation();
  const ctaHref = isSafeHomeCtaHref(copy?.ctaHref) && copy?.ctaHref?.trim()
    ? copy.ctaHref.trim()
    : "/map";

  return (
    <section id="explore-map" className="bg-background py-14 sm:py-16 lg:py-20">
      <div className="app-container content-max">
        <Link
          href={l(ctaHref)}
          aria-label={t("sections.homepage.mapGateway.ariaLabel")}
          className="group grid min-w-0 grid-cols-[minmax(0,1fr)] overflow-hidden rounded-xl border border-[#d9a21b]/25 bg-[#fffdf8] shadow-[0_22px_70px_-48px_rgba(15,45,36,0.45)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none lg:grid-cols-[0.62fr_1.38fr]"
        >
          <div className="flex min-w-0 w-full max-w-full flex-col justify-center p-6 sm:p-8 lg:max-w-md lg:p-8 xl:p-9">
            <span className="inline-flex min-w-0 max-w-full items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <MapPinned className="h-4 w-4" strokeWidth={1.8} />
              {cmsText(copy?.eyebrow, t("sections.homepage.mapGateway.eyebrow"))}
            </span>
            <h2 className="mt-4 max-w-[13ch] font-serif text-3xl font-medium leading-[1.02] tracking-normal text-[#0F2D24] sm:text-4xl lg:text-[2.65rem] xl:text-[3rem]">
              {cmsText(copy?.title, t("sections.homepage.mapGateway.title"))}
            </h2>
            <p className="mt-4 max-w-[28rem] text-sm leading-6 text-muted-foreground sm:text-base">
              {cmsText(copy?.subtitle ?? copy?.description, t("sections.homepage.mapGateway.subtitle"))}
            </p>
            <div className="mt-6 min-w-0 max-w-full">
              <span
                className={buttonVariants({
                  variant: "gold",
                  size: "lg",
                  className:
                    "w-full max-w-full whitespace-normal px-5 text-center leading-tight sm:w-auto sm:px-8",
                })}
              >
                {cmsText(copy?.ctaLabel, t("sections.homepage.mapGateway.cta"))}
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>

          <div className="min-w-0 border-t border-[#d9a21b]/15 lg:border-l lg:border-t-0">
            <AlgarveMapIllustration alt={t("sections.homepage.mapGateway.illustrationLabel")} />
          </div>
        </Link>
      </div>
    </section>
  );
}

export default SignatureMapSection;
