import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Clock,
  Users,
  MapPin,
  Sparkles,
  Ship,
  Plane,
  Map,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { translateCategoryValue } from "@/lib/translateCategoryValue";

interface LuxuryExperienceLayoutProps {
  details: Record<string, unknown>;
  bookingUrl?: string;
}

export function LuxuryExperienceLayout({ details }: LuxuryExperienceLayoutProps) {
  const { t } = useTranslation();
  const experienceType = details.experience_type as string;
  const duration = details.duration as string;
  const privateOrShared = details.private_or_shared as string;
  const capacity = details.capacity as number;
  const customizationLevel = details.customization_level as string;
  const departureLocations = (details.departure_locations as string[]) || [];
  const experienceIcons: Record<string, LucideIcon> = {
    yacht: Ship,
    helicopter: Plane,
    tour: Map,
    other: Sparkles,
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.experience.experienceDetails")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="luxury-card p-4 text-center">
            {(() => {
              const ExperienceIcon = experienceIcons[experienceType] ?? Sparkles;
              return <ExperienceIcon className="h-7 w-7 mx-auto mb-2 text-primary" />;
            })()}
            <p className="text-sm text-muted-foreground">{t("categoryLayouts.common.type")}</p>
            <p className="font-medium capitalize">{translateCategoryValue(t, experienceType) || t("categoryLayouts.common.typeFallback.experience")}</p>
          </div>
          {duration && (
            <div className="luxury-card p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.experience.duration")}</p>
              <p className="font-medium">{duration}</p>
            </div>
          )}
          {capacity && (
            <div className="luxury-card p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.experience.capacity")}</p>
              <p className="font-medium">{t("categoryLayouts.experience.guests", { count: capacity })}</p>
            </div>
          )}
          {privateOrShared && (
            <div className="luxury-card p-4 text-center">
              {privateOrShared === "private" ? (
                <Lock className="h-6 w-6 mx-auto mb-2 text-primary" />
              ) : (
                <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              )}
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.experience.booking")}</p>
              <p className="font-medium capitalize">{translateCategoryValue(t, privateOrShared)}</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.experience.atAGlance")}</h2>
        <div className="flex flex-wrap gap-3">
          {duration && <Badge variant="secondary" className="px-4 py-2"><Clock className="h-4 w-4 mr-2" />{duration}</Badge>}
          {capacity && <Badge variant="secondary" className="px-4 py-2"><Users className="h-4 w-4 mr-2" />{t("categoryLayouts.experience.upToGuests", { count: capacity })}</Badge>}
          {customizationLevel && (
            <Badge variant="secondary" className="px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              {customizationLevel === 'full' ? t("categoryLayouts.experience.fullyCustomizable") : customizationLevel === 'partial' ? t("categoryLayouts.experience.partiallyCustomizable") : t("categoryLayouts.experience.fixedItinerary")}
            </Badge>
          )}
        </div>
      </div>

      {departureLocations.length > 0 && (
        <div>
          <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.experience.departurePoints")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departureLocations.map((location) => (
              <Card key={location} className="p-4 flex items-center gap-3 bg-muted/30"><MapPin className="h-5 w-5 text-primary flex-shrink-0" /><span>{location}</span></Card>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
