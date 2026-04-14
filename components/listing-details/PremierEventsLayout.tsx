import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Sparkles, Lock, Globe, Ticket, ExternalLink, Star, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { translateCategoryValue } from "@/lib/translateCategoryValue";

interface PremierEventsLayoutProps {
  details: Record<string, unknown>;
}

export function PremierEventsLayout({ details }: PremierEventsLayoutProps) {
  const { t } = useTranslation();
  const eventType = details.event_type as string;
  const eventDate = details.event_date as string;
  const eventEndDate = details.event_end_date as string;
  const startTime = details.start_time as string;
  const endTime = details.end_time as string;
  const venueName = details.venue_name as string;
  const accessType = details.access_type as string;
  const capacity = details.capacity as number;
  const dressCode = details.dress_code as string;
  const bookingUrl = details.booking_url as string;
  const ticketPriceFrom = details.ticket_price_from as number;
  const ticketPriceTo = details.ticket_price_to as number;
  const highlights = details.highlights as string[] ?? [];
  const featuredGuests = details.featured_guests as string[] ?? [];
  const organizerName = details.organizer_name as string;
  const recurring = details.recurring as boolean;
  const recurrencePattern = details.recurrence_pattern as string;

  const accessTypeIcons: Record<string, typeof Globe> = { public: Globe, private: Lock, invitation_only: Ticket };
  const AccessIcon = accessTypeIcons[accessType] ?? Globe;

  const formatPrice = () => {
    if (!ticketPriceFrom && !ticketPriceTo) return null;
    if (ticketPriceFrom === 0 && !ticketPriceTo) return t("categoryLayouts.events.freeEntry");
    if (ticketPriceFrom && ticketPriceTo && ticketPriceFrom !== ticketPriceTo) return `€${ticketPriceFrom} - €${ticketPriceTo}`;
    return t("categoryLayouts.events.fromPrice", { price: ticketPriceFrom ?? ticketPriceTo });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.events.eventDetails")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="luxury-card p-4 text-center">
            <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">{t("categoryLayouts.events.date")}</p>
            <p className="font-medium text-sm">{eventDate || t("categoryLayouts.events.tba")}</p>
            {eventEndDate && <p className="text-xs text-muted-foreground">to {eventEndDate}</p>}
          </div>
          {(startTime || endTime) && (
            <div className="luxury-card p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.events.time")}</p>
              <p className="font-medium text-sm">{startTime}{endTime ? ` - ${endTime}` : ''}</p>
            </div>
          )}
          {venueName && (
            <div className="luxury-card p-4 text-center">
              <MapPin className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.events.venue")}</p>
              <p className="font-medium text-sm">{venueName}</p>
            </div>
          )}
          <div className="luxury-card p-4 text-center">
            <AccessIcon className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">{t("categoryLayouts.events.access")}</p>
            <p className="font-medium text-sm capitalize">{translateCategoryValue(t, accessType) || t("categoryLayouts.common.typeFallback.public")}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.events.atAGlance")}</h2>
        <div className="flex flex-wrap gap-3">
          {eventType && <Badge variant="secondary" className="px-4 py-2"><Sparkles className="h-4 w-4 mr-2" />{translateCategoryValue(t, eventType)}</Badge>}
          {capacity && <Badge variant="secondary" className="px-4 py-2"><Users className="h-4 w-4 mr-2" />{t("categoryLayouts.events.upToGuests", { count: capacity })}</Badge>}
          {dressCode && <Badge variant="secondary" className="px-4 py-2"><Star className="h-4 w-4 mr-2" />{dressCode}</Badge>}
          {recurring && recurrencePattern && <Badge variant="outline" className="px-4 py-2"><Calendar className="h-4 w-4 mr-2" />{translateCategoryValue(t, recurrencePattern)} Event</Badge>}
          {formatPrice() && <Badge className="px-4 py-2 bg-primary/20 text-primary border-primary/30"><Ticket className="h-4 w-4 mr-2" />{formatPrice()}</Badge>}
        </div>
      </div>

      {highlights.length > 0 && (
        <div>
          <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.events.eventHighlights")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {highlights.map((highlight, index) => (
              <Card key={index} className="p-4 flex items-center gap-3 bg-muted/30 border-primary/10"><Sparkles className="h-5 w-5 text-primary flex-shrink-0" /><span>{highlight}</span></Card>
            ))}
          </div>
        </div>
      )}

      {featuredGuests.length > 0 && (
        <div>
          <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.events.featuredGuests")}</h2>
          <div className="flex flex-wrap gap-3">
            {featuredGuests.map((guest, index) => (<Badge key={index} variant="outline" className="px-4 py-2 text-sm"><User className="h-4 w-4 mr-2" />{guest}</Badge>))}
          </div>
        </div>
      )}

      {organizerName && (
        <div>
          <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.events.organizedBy")}</h2>
          <Card className="p-4 flex items-center gap-3 bg-muted/30 w-fit">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center"><User className="h-5 w-5 text-primary" /></div>
            <span className="font-medium">{organizerName}</span>
          </Card>
        </div>
      )}

      {bookingUrl && (
        <div className="pt-4">
          <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="w-full sm:w-auto"><Ticket className="h-5 w-5 mr-2" />{t("categoryLayouts.events.bookRsvp")}<ExternalLink className="h-4 w-4 ml-2" /></Button>
          </a>
        </div>
      )}
    </div>
  );
}
