import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sun,
  Sunset,
  PartyPopper,
  Users,
  Umbrella,
  Crown,
  Sofa,
  BedDouble,
  Music,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { translateCategoryValue } from "@/lib/translateCategoryValue";

interface BeachClubLayoutProps {
  details: Record<string, unknown>;
  bookingUrl?: string;
}

export function BeachClubLayout({ details }: BeachClubLayoutProps) {
  const { t } = useTranslation();
  const placeType = details.place_type as string;
  const atmosphere = details.atmosphere as string;
  const sunbedsAvailable = details.sunbeds_available as boolean;
  const djSchedule = details.dj_schedule as string;
  const vipAreas = details.vip_areas as boolean;
  const balineseBeds = details.balinese_beds as boolean;
  const sunsetView = details.sunset_view as boolean;

  const getAtmosphereIcon = () => {
    switch (atmosphere) {
      case "party": return <PartyPopper className="h-5 w-5" />;
      case "family": return <Users className="h-5 w-5" />;
      default: return <Sun className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.beach.beachExperience")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="premium-card p-4 text-center">
            <Umbrella className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">{t("categoryLayouts.common.type")}</p>
            <p className="font-medium capitalize">{translateCategoryValue(t, placeType) || t("categoryLayouts.common.typeFallback.beach")}</p>
          </div>
          {atmosphere && (
            <div className="premium-card p-4 text-center">
              <div className="mx-auto mb-2 text-primary">{getAtmosphereIcon()}</div>
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.beach.atmosphere")}</p>
              <p className="font-medium capitalize">{translateCategoryValue(t, atmosphere)}</p>
            </div>
          )}
          {sunsetView && (
            <div className="premium-card p-4 text-center">
              <Sunset className="h-6 w-6 mx-auto mb-2 text-orange-400" />
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.beach.sunset")}</p>
              <p className="font-medium">{t("categoryLayouts.beach.amazingViews")}</p>
            </div>
          )}
          {vipAreas && (
            <div className="premium-card p-4 text-center">
              <Crown className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.beach.vip")}</p>
              <p className="font-medium">{t("categoryLayouts.beach.privateAreas")}</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.beach.servicesAmenities")}</h2>
        <div className="flex flex-wrap gap-3">
          {sunbedsAvailable && (
            <Badge variant="secondary" className="px-4 py-2">
              <Sofa className="h-4 w-4 mr-2" />
              {t("categoryLayouts.beach.sunbedsAvailable")}
            </Badge>
          )}
          {balineseBeds && (
            <Badge variant="secondary" className="px-4 py-2">
              <BedDouble className="h-4 w-4 mr-2" />
              {t("categoryLayouts.beach.balineseBeds")}
            </Badge>
          )}
          {vipAreas && (
            <Badge variant="secondary" className="px-4 py-2">
              <Crown className="h-4 w-4 mr-2" />
              {t("categoryLayouts.beach.vipCabanas")}
            </Badge>
          )}
          {djSchedule && (
            <Badge variant="secondary" className="px-4 py-2">
              <Music className="h-4 w-4 mr-2" />
              {t("categoryLayouts.beach.liveDj")}
            </Badge>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.beach.bestTimeToVisit")}</h2>
        <Tabs defaultValue="day" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="day"><Sun className="h-4 w-4 mr-2" />{t("categoryLayouts.beach.daytime")}</TabsTrigger>
            <TabsTrigger value="sunset"><Sunset className="h-4 w-4 mr-2" />{t("categoryLayouts.beach.sunset")}</TabsTrigger>
          </TabsList>
          <TabsContent value="day" className="mt-4">
            <div className="premium-card p-4">
              <p className="text-muted-foreground">{t("categoryLayouts.beach.daytimeDescription")}</p>
            </div>
          </TabsContent>
          <TabsContent value="sunset" className="mt-4">
            <div className="premium-card p-4">
              <p className="text-muted-foreground">
                {sunsetView ? t("categoryLayouts.beach.sunsetWithView") : t("categoryLayouts.beach.sunsetWithout")}
              </p>
              {djSchedule && (
                <p className="text-sm text-primary mt-2 inline-flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  {t("categoryLayouts.beach.djSchedule", { schedule: djSchedule })}
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
