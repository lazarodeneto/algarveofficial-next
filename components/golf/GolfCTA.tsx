import { Button } from "@/components/ui/Button";

interface GolfCTALabels {
  requestTeeTime: string;
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
  const primaryHref = bookingUrl ?? websiteUrl;
  const hasAnyAction = primaryHref || contactHref || websiteUrl;
  if (!hasAnyAction) return null;

  return (
    <section className="mx-auto flex max-w-6xl justify-center py-12">
      <div className="flex flex-wrap justify-center gap-3 rounded-2xl border border-border/70 p-4 shadow-sm">
        {primaryHref ? (
          <Button asChild className="bg-black text-white hover:bg-black/90">
            <a href={primaryHref} target="_blank" rel="noopener noreferrer">
              {labels.requestTeeTime}
            </a>
          </Button>
        ) : null}
        {contactHref ? (
          <Button asChild variant="outline">
            <a href={contactHref}>{labels.contactClub}</a>
          </Button>
        ) : null}
        {websiteUrl ? (
          <Button asChild variant="outline">
            <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
              {labels.visitWebsite}
            </a>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
