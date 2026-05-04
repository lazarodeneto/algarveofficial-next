import { Button } from "@/components/ui/Button";

interface GolfCTALabels {
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

  return (
    <section className="mx-auto flex max-w-6xl justify-center py-12">
      <div className="flex flex-wrap justify-center gap-3 rounded-2xl border border-border/70 p-4 shadow-sm">
        {bookingUrl ? (
          <Button asChild className="bg-black text-white hover:bg-black/90">
            <a
              href={bookingUrl}
              target="_blank"
              rel="sponsored noopener noreferrer"
              aria-label={labels.bookTeeTimeAria}
            >
              {labels.bookTeeTime}
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
