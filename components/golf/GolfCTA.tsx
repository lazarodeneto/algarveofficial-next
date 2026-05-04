import { Calendar } from "lucide-react";

import { Button } from "@/components/ui/Button";

interface GolfCTALabels {
  readyToPlay: string;
  bookTeeTimeSubtext: string;
  bookTeeTime: string;
  bookTeeTimeAria: string;
  contactClub: string;
  visitWebsite: string;
}

interface GolfCTAProps {
  bookingUrl?: string | null;
  contactHref?: string | null;
  websiteUrl?: string | null;
  labels: GolfCTALabels;
}

export function GolfCTA({ bookingUrl, contactHref, websiteUrl, labels }: GolfCTAProps) {
  const hasAnyAction = bookingUrl || contactHref || websiteUrl;
  if (!hasAnyAction) return null;

  const primaryAction = bookingUrl
    ? {
        href: bookingUrl,
        label: labels.bookTeeTime,
        ariaLabel: labels.bookTeeTimeAria,
        target: "_blank",
        rel: "sponsored noopener noreferrer",
      }
    : websiteUrl
      ? {
          href: websiteUrl,
          label: labels.visitWebsite,
          ariaLabel: labels.visitWebsite,
          target: "_blank",
          rel: "noopener noreferrer",
        }
      : contactHref
        ? {
            href: contactHref,
            label: labels.contactClub,
            ariaLabel: labels.contactClub,
            target: undefined,
            rel: undefined,
          }
        : null;

  if (!primaryAction) return null;

  return (
    <section className="mx-auto max-w-6xl py-12">
      <div className="rounded-[1.4rem] border border-slate-300/80 bg-[#d2ddd6] px-7 py-7 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-xl font-medium text-foreground">{labels.readyToPlay}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{labels.bookTeeTimeSubtext}</p>
          </div>
          <Button
            asChild
            size="lg"
            className="w-full bg-[#14a84b] px-8 text-base text-black hover:bg-[#119743] sm:w-auto sm:min-w-[230px]"
          >
            <a
              href={primaryAction.href}
              target={primaryAction.target}
              rel={primaryAction.rel}
              aria-label={primaryAction.ariaLabel}
            >
              <Calendar className="h-4 w-4" />
              {primaryAction.label}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
