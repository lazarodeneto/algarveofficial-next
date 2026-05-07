import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ShoppingBag, Calendar, Users, Receipt } from "lucide-react";
import { useTranslation } from "react-i18next";
import { translateCategoryValue } from "@/lib/translateCategoryValue";

interface ShoppingLayoutProps {
  details: Record<string, unknown>;
  bookingUrl?: string;
}

export function ShoppingLayout({ details }: ShoppingLayoutProps) {
  const { t } = useTranslation();
  const shopType = typeof details.shop_type === "string" ? details.shop_type : "";
  const brandsCarried = Array.isArray(details.brands_carried)
    ? details.brands_carried.filter((brand): brand is string => typeof brand === "string" && brand.trim().length > 0)
    : [];
  const personalShopping = details.personal_shopping === true;
  const appointmentOnly = details.appointment_only === true;
  const taxFree = details.tax_free === true;
  const hasShoppingExperience = Boolean(shopType || personalShopping || taxFree);
  const hasServices = Boolean(personalShopping || appointmentOnly || taxFree);

  if (brandsCarried.length === 0 && !hasShoppingExperience && !hasServices) {
    return null;
  }

  return (
    <div className="space-y-8">
      {brandsCarried.length > 0 && (
        <div>
          <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.shopping.featuredBrands")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {brandsCarried.map((brand) => (
              <Card key={brand} className="p-4 text-center bg-muted/30 hover:bg-muted/50 transition-colors">
                <ShoppingBag className="h-6 w-6 mx-auto mb-2 text-primary" /><p className="font-medium">{brand}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {hasShoppingExperience && (
        <div>
          <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.shopping.shoppingExperience")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {shopType && (
              <div className="premium-card p-4 text-center">
                <ShoppingBag className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">{t("categoryLayouts.shopping.storeType")}</p>
                <p className="font-medium capitalize">{translateCategoryValue(t, shopType)}</p>
              </div>
            )}
            {personalShopping && (
              <div className="premium-card p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">{t("categoryLayouts.shopping.service")}</p>
                <p className="font-medium">{t("categoryLayouts.shopping.personalShopping")}</p>
              </div>
            )}
            {taxFree && (
              <div className="premium-card p-4 text-center">
                <Receipt className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">{t("categoryLayouts.shopping.benefit")}</p>
                <p className="font-medium">{t("categoryLayouts.shopping.taxFree")}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {hasServices && (
        <div>
          <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.shopping.services")}</h2>
          <div className="flex flex-wrap gap-3">
            {personalShopping && <Badge variant="secondary" className="px-4 py-2"><Users className="h-4 w-4 mr-2" />{t("categoryLayouts.shopping.personalShoppingAvailable")}</Badge>}
            {appointmentOnly && <Badge variant="outline" className="px-4 py-2"><Calendar className="h-4 w-4 mr-2" />{t("categoryLayouts.shopping.byAppointmentOnly")}</Badge>}
            {taxFree && <Badge variant="secondary" className="px-4 py-2"><Receipt className="h-4 w-4 mr-2" />{t("categoryLayouts.shopping.taxFreeShopping")}</Badge>}
          </div>
        </div>
      )}

    </div>
  );
}
