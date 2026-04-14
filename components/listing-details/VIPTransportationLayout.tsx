import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Car, Users, User, Clock, Ship, Plane, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { translateCategoryValue } from "@/lib/translateCategoryValue";

interface VIPTransportationLayoutProps {
  details: Record<string, unknown>;
  bookingUrl?: string;
}

export function VIPTransportationLayout({ details }: VIPTransportationLayoutProps) {
  const { t } = useTranslation();
  const transportType = details.transport_type as string;
  const capacity = details.capacity as number;
  const withDriverOrPilot = details.with_driver_or_pilot as boolean;
  const vehicleModels = details.vehicle_models as string[] ?? [];
  const onboardServices = details.onboard_services as string[] ?? [];
  const hourlyOrDaily = details.hourly_or_daily as string;
  const transportIcons: Record<string, LucideIcon> = {
    car: Car,
    yacht: Ship,
    helicopter: Plane,
    jet: Plane,
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.transport.vehicleDetails")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="luxury-card p-4 text-center">
            {(() => {
              const TransportIcon = transportIcons[transportType] ?? Car;
              return <TransportIcon className="h-7 w-7 mx-auto mb-2 text-primary" />;
            })()}
            <p className="text-sm text-muted-foreground">{t("categoryLayouts.common.type")}</p>
            <p className="font-medium capitalize">{translateCategoryValue(t, transportType) || t("categoryLayouts.common.typeFallback.vehicle")}</p>
          </div>
          {capacity && (
            <div className="luxury-card p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.transport.capacity")}</p>
              <p className="font-medium">{t("categoryLayouts.transport.passengers", { count: capacity })}</p>
            </div>
          )}
          <div className="luxury-card p-4 text-center">
            <User className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">{t("categoryLayouts.transport.driverPilot")}</p>
            <p className="font-medium">{withDriverOrPilot ? t("categoryLayouts.transport.included") : t("categoryLayouts.transport.selfDrive")}</p>
          </div>
          {hourlyOrDaily && (
            <div className="luxury-card p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.transport.rental")}</p>
              <p className="font-medium capitalize">{translateCategoryValue(t, hourlyOrDaily)}</p>
            </div>
          )}
        </div>
      </div>

      {vehicleModels.length > 0 && (
        <div>
          <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.transport.availableFleet")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicleModels.map((model) => (
              <Card key={model} className="p-4 flex items-center gap-3 bg-muted/30"><Car className="h-5 w-5 text-primary flex-shrink-0" /><span className="font-medium">{model}</span></Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.transport.comfortServices")}</h2>
        <div className="flex flex-wrap gap-3">
          {capacity && <Badge variant="secondary" className="px-4 py-2"><Users className="h-4 w-4 mr-2" />{t("categoryLayouts.transport.passengers", { count: capacity })}</Badge>}
          {withDriverOrPilot && <Badge variant="secondary" className="px-4 py-2"><User className="h-4 w-4 mr-2" />{t("categoryLayouts.transport.professionalDriver")}</Badge>}
          {onboardServices.map((service) => (
            <Badge key={service} variant="outline" className="px-4 py-2 capitalize">{service.replace('_', ' ')}</Badge>
          ))}
        </div>
      </div>

    </div>
  );
}
