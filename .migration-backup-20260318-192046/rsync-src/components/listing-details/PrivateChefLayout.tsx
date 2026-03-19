import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChefHat, Euro, Globe, MapPin, Utensils } from "lucide-react";
import { useTranslation } from "react-i18next";
import { translateCategoryValue } from "@/lib/translateCategoryValue";

interface PrivateChefLayoutProps {
  details: Record<string, unknown>;
  bookingUrl?: string;
}

export function PrivateChefLayout({ details, bookingUrl }: PrivateChefLayoutProps) {
  const { t } = useTranslation();
  const cuisineStyles = (details.cuisine_styles as string[]) || [];
  const serviceTypes = (details.service_types as string[]) || [];
  const minimumMenuPrice = details.minimum_menu_price as number;
  const sampleMenus = (details.sample_menus as string[]) || [];
  const dietaryOptions = (details.dietary_options as string[]) || [];
  const languages = (details.languages as string[]) || [];
  const serviceArea = (details.service_area as string[]) || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.privateChef.chefProfile")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="luxury-card p-4 text-center">
            <ChefHat className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">{t("categoryLayouts.privateChef.specialties")}</p>
            <p className="font-medium">{t("categoryLayouts.privateChef.cuisinesCount", { count: cuisineStyles.length })}</p>
          </div>
          {minimumMenuPrice && (
            <div className="luxury-card p-4 text-center">
              <Euro className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.privateChef.startingFrom")}</p>
              <p className="font-medium">€{minimumMenuPrice}+</p>
            </div>
          )}
          {languages.length > 0 && (
            <div className="luxury-card p-4 text-center">
              <Globe className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.privateChef.languages")}</p>
              <p className="font-medium">{t("categoryLayouts.privateChef.spokenCount", { count: languages.length })}</p>
            </div>
          )}
          {serviceArea.length > 0 && (
            <div className="luxury-card p-4 text-center">
              <MapPin className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.privateChef.coverage")}</p>
              <p className="font-medium">{t("categoryLayouts.privateChef.areasCount", { count: serviceArea.length })}</p>
            </div>
          )}
        </div>
      </div>

      {cuisineStyles.length > 0 && (
        <div>
          <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.privateChef.cuisineStyles")}</h2>
          <div className="flex flex-wrap gap-3">
            {cuisineStyles.map((style) => (
              <Badge key={style} variant="secondary" className="px-4 py-2 capitalize"><Utensils className="h-4 w-4 mr-2" />{translateCategoryValue(t, style)}</Badge>
            ))}
          </div>
        </div>
      )}

      {serviceTypes.length > 0 && (
        <div>
          <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.privateChef.serviceOptions")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {serviceTypes.map((service) => (
              <Card key={service} className="p-4 text-center bg-muted/30"><p className="font-medium capitalize">{translateCategoryValue(t, service)}</p></Card>
            ))}
          </div>
        </div>
      )}

      {dietaryOptions.length > 0 && (
        <div>
          <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.privateChef.dietaryOptions")}</h2>
          <div className="flex flex-wrap gap-3">
            {dietaryOptions.map((option) => (
              <Badge key={option} variant="outline" className="px-4 py-2 capitalize">{translateCategoryValue(t, option)}</Badge>
            ))}
          </div>
        </div>
      )}

      {sampleMenus.length > 0 && (
        <div>
          <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.privateChef.sampleMenus")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleMenus.map((menu, idx) => (
              <Card key={idx} className="p-4 bg-gradient-to-br from-charcoal to-charcoal-dark border-primary/20"><p className="text-muted-foreground">{menu}</p></Card>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
