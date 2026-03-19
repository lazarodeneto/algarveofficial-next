import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Crown,
  Clock,
  Globe,
  User,
  Sparkles,
  Zap,
  Plane,
  Ship,
  CalendarDays,
  PartyPopper,
  ShoppingBag,
  House,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { translateCategoryValue } from "@/lib/translateCategoryValue";

interface VIPConciergeLayoutProps {
  details: Record<string, unknown>;
  bookingUrl?: string;
}

export function VIPConciergeLayout({ details, bookingUrl }: VIPConciergeLayoutProps) {
  const { t } = useTranslation();
  const conciergeServices = (details.concierge_services as string[]) || [];
  const availability = details.availability as string;
  const languages = (details.languages as string[]) || [];
  const responseTime = details.response_time as string;
  const dedicatedManager = details.dedicated_manager as boolean;

  const serviceIcons: Record<string, LucideIcon> = {
    butler: User,
    sommelier: Wine,
    jet: Plane,
    yacht: Ship,
    reservations: CalendarDays,
    events: PartyPopper,
    shopping: ShoppingBag,
    real_estate: House,
    travel: Globe,
  };

  const getAvailabilityLabel = () => {
    switch (availability) {
      case "24_7": return t("categoryLayouts.concierge.service247");
      case "on_demand": return t("categoryLayouts.concierge.onDemand");
      case "business_hours": return t("categoryLayouts.concierge.businessHours");
      default: return availability || t("categoryLayouts.concierge.available");
    }
  };

  return (
    <div className="space-y-8">
      {conciergeServices.length > 0 && (
        <div>
          <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.concierge.conciergeServices")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {conciergeServices.map((service) => (
              <Card key={service} className="p-4 text-center bg-muted/30 hover:bg-muted/50 transition-colors">
                {(() => {
                  const ServiceIcon = serviceIcons[service] ?? Sparkles;
                  return <ServiceIcon className="h-6 w-6 mx-auto mb-2 text-primary" />;
                })()}
                <p className="font-medium capitalize">{translateCategoryValue(t, service)}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.concierge.availabilityResponse")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="luxury-card p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">{t("categoryLayouts.concierge.availability")}</p>
            <p className="font-medium">{getAvailabilityLabel()}</p>
          </div>
          {responseTime && (
            <div className="luxury-card p-4 text-center">
              <Zap className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.concierge.responseTime")}</p>
              <p className="font-medium">{responseTime}</p>
            </div>
          )}
          {languages.length > 0 && (
            <div className="luxury-card p-4 text-center">
              <Globe className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.privateChef.languages")}</p>
              <p className="font-medium">{languages.map(l => translateCategoryValue(t, l)).join(', ')}</p>
            </div>
          )}
          {dedicatedManager && (
            <div className="luxury-card p-4 text-center">
              <User className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.concierge.manager")}</p>
              <p className="font-medium">{t("categoryLayouts.concierge.dedicated")}</p>
            </div>
          )}
        </div>
      </div>

      <div className="luxury-card p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-primary/20"><Crown className="h-8 w-8 text-primary" /></div>
          <div>
            <h3 className="text-lg font-serif font-medium">{t("categoryLayouts.concierge.vipPromise")}</h3>
            <p className="text-sm text-muted-foreground mt-2">{t("categoryLayouts.concierge.vipPromiseText")}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
