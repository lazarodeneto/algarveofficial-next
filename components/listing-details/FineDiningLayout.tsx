import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ChefHat,
  Star,
  Wine,
  Clock,
  Shirt,
  UtensilsCrossed,
  Globe2,
  Waves,
  Lock,
  Utensils,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { translateCategoryValue } from "@/lib/translateCategoryValue";

interface FineDiningLayoutProps {
  details: Record<string, unknown>;
  bookingUrl?: string;
}

export function FineDiningLayout({ details }: FineDiningLayoutProps) {
  const { t } = useTranslation();
  const diningType = details.dining_type as string;
  const cuisineType = details.cuisine_type as string;
  const diningExperience = details.dining_experience as string[] ?? [];
  const chefName = details.chef_name as string;
  const tastingMenuAvailable = details.tasting_menu_available as boolean;
  const dressCode = details.dress_code as string;
  const reservationRequired = details.reservation_required as boolean;
  const winePairing = details.wine_pairing as boolean;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.dining.culinaryProfile")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="luxury-card p-4 text-center">
            <UtensilsCrossed className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">{t("categoryLayouts.dining.diningType")}</p>
            <p className="font-medium capitalize">{translateCategoryValue(t, diningType) || t("categoryDataValues.restaurant")}</p>
          </div>
          {cuisineType && (
            <div className="luxury-card p-4 text-center">
              <Globe2 className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.dining.cuisine")}</p>
              <p className="font-medium capitalize">{translateCategoryValue(t, cuisineType)}</p>
            </div>
          )}
          {dressCode && (
            <div className="luxury-card p-4 text-center">
              <Shirt className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.dining.dressCode")}</p>
              <p className="font-medium capitalize">{dressCode}</p>
            </div>
          )}
        </div>
      </div>

      {diningExperience.length > 0 && (
        <div>
          <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.dining.diningExperience")}</h2>
          <div className="flex flex-wrap gap-3">
            {diningExperience.map((exp) => (
              <Badge key={exp} variant="secondary" className="px-4 py-2 text-sm capitalize">
                {exp === "michelin" && <Star className="h-4 w-4 mr-2" />}
                {exp === "ocean_view" && <Waves className="h-4 w-4 mr-2" />}
                {exp === "private" && <Lock className="h-4 w-4 mr-2" />}
                {translateCategoryValue(t, exp)}
              </Badge>
            ))}
            {tastingMenuAvailable && (
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Utensils className="h-4 w-4 mr-2" />
                {t("categoryLayouts.dining.tastingMenuAvailable")}
              </Badge>
            )}
            {winePairing && (
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Wine className="h-4 w-4 mr-2" />
                {t("categoryLayouts.dining.winePairing")}
              </Badge>
            )}
            {reservationRequired && (
              <Badge variant="outline" className="px-4 py-2 text-sm">
                <Clock className="h-4 w-4 mr-2" />
                {t("categoryLayouts.dining.reservationRequired")}
              </Badge>
            )}
          </div>
        </div>
      )}

      {chefName && (
        <div>
          <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.dining.chefSpotlight")}</h2>
          <Card className="p-6 bg-gradient-to-br from-charcoal to-charcoal-dark border-primary/20">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <ChefHat className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-medium">{chefName}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t("categoryLayouts.dining.executiveChef")}</p>
                {cuisineType && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {t("categoryLayouts.dining.specializingIn", { cuisine: translateCategoryValue(t, cuisineType) })}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
