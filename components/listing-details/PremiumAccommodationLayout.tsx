import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Star,
  Waves,
  Dumbbell,
  Sparkles,
  PawPrint,
  Crown,
  Home,
  LandPlot,
  UtensilsCrossed,
  Wine,
  Wifi,
  Car,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { translateCategoryValue } from "@/lib/translateCategoryValue";

interface PremiumAccommodationLayoutProps {
  details: Record<string, unknown>;
  bookingUrl?: string;
}

const amenityIcons: Record<string, React.ReactNode> = {
  pool: <Waves className="h-5 w-5" />,
  spa: <Sparkles className="h-5 w-5" />,
  gym: <Dumbbell className="h-5 w-5" />,
  beach_access: <Waves className="h-5 w-5" />,
  golf_access: <LandPlot className="h-5 w-5" />,
  restaurant: <UtensilsCrossed className="h-5 w-5" />,
  bar: <Wine className="h-5 w-5" />,
  wifi: <Wifi className="h-5 w-5" />,
  parking: <Car className="h-5 w-5" />,
  concierge: <Crown className="h-5 w-5" />,
};

export function PremiumAccommodationLayout({ details }: PremiumAccommodationLayoutProps) {
  const { t } = useTranslation();
  const accommodationType = typeof details.accommodation_type === "string" ? details.accommodation_type : "";
  const numberOfUnits = typeof details.number_of_units === "number" ? details.number_of_units : null;
  const amenities = Array.isArray(details.amenities)
    ? details.amenities.filter((amenity): amenity is string => typeof amenity === "string" && amenity.trim().length > 0)
    : [];
  const suitableFor = Array.isArray(details.suitable_for)
    ? details.suitable_for.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    : [];
  const starRating = typeof details.star_rating === "number" ? details.star_rating : null;
  const conciergeAvailable = details.concierge_available === true;
  const privateStaff = details.private_staff === true;
  const petFriendly = details.pet_friendly === true;
  const hasHighlights = Boolean(accommodationType || numberOfUnits || starRating || suitableFor.length > 0);
  const hasServices = Boolean(conciergeAvailable || privateStaff || petFriendly);

  if (!hasHighlights && amenities.length === 0 && !hasServices) {
    return null;
  }

  return (
    <div className="space-y-8">
      {hasHighlights && (
        <div>
          <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.accommodation.highlights")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {accommodationType && (
              <div className="premium-card p-4 text-center">
                <Building2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">{t("categoryLayouts.common.type")}</p>
                <p className="font-medium capitalize">{translateCategoryValue(t, accommodationType)}</p>
              </div>
            )}
            {numberOfUnits && (
              <div className="premium-card p-4 text-center">
                <Home className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">{t("categoryLayouts.accommodation.unitsRooms")}</p>
                <p className="font-medium">{numberOfUnits}</p>
              </div>
            )}
            {starRating && (
              <div className="premium-card p-4 text-center">
                <Star className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">{t("categoryLayouts.accommodation.starRating")}</p>
                <p className="font-medium">{t("categoryLayouts.accommodation.stars", { count: starRating })}</p>
              </div>
            )}
            {suitableFor.length > 0 && (
              <div className="premium-card p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">{t("categoryLayouts.accommodation.idealFor")}</p>
                <p className="font-medium capitalize">{suitableFor.map((s) => translateCategoryValue(t, s)).join(", ")}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {amenities.length > 0 && (
        <div>
          <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.accommodation.amenities")}</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {amenities.map((amenity) => (
              <div key={amenity} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                {amenityIcons[amenity] || <Sparkles className="h-5 w-5" />}
                <span className="text-sm text-center capitalize">{translateCategoryValue(t, amenity)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasServices && (
        <div>
          <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.accommodation.servicesFeatures")}</h2>
          <div className="flex flex-wrap gap-3">
            {conciergeAvailable && (
              <Badge variant="secondary" className="px-4 py-2">
                <Crown className="h-4 w-4 mr-2" />
                {t("categoryLayouts.accommodation.conciergeService")}
              </Badge>
            )}
            {privateStaff && (
              <Badge variant="secondary" className="px-4 py-2">
                <Users className="h-4 w-4 mr-2" />
                {t("categoryLayouts.accommodation.privateStaff")}
              </Badge>
            )}
            {petFriendly && (
              <Badge variant="secondary" className="px-4 py-2">
                <PawPrint className="h-4 w-4 mr-2" />
                {t("categoryLayouts.accommodation.petFriendly")}
              </Badge>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
