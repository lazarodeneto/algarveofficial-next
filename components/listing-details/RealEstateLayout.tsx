import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Bed, Bath, Maximize, MapPin, Waves, TreePine, Shield, Calendar, Euro } from "lucide-react";
import { useTranslation } from "react-i18next";
import { translateCategoryValue } from "@/lib/translateCategoryValue";
import type { LucideIcon } from "lucide-react";

interface RealEstateLayoutProps {
  details: Record<string, unknown>;
  onInquire?: () => void;
}

export function RealEstateLayout({ details, onInquire }: RealEstateLayoutProps) {
  const { t } = useTranslation();
  const propertyType = details.property_type as string;
  const transactionType = details.transaction_type as string;
  const bedrooms = details.bedrooms as number;
  const bathrooms = details.bathrooms as number;
  const propertySizeM2 = details.property_size_m2 as number;
  const plotSizeM2 = details.plot_size_m2 as number;
  const seaView = details.sea_view as boolean;
  const golfFront = details.golf_front as boolean;
  const gatedCommunity = details.gated_community as boolean;
  const price = details.price as number;
  const priceUnit = details.price_unit as string;

  type OverviewMetric = {
    key: string;
    label: string;
    value: string;
    icon: LucideIcon;
  };

  const formatPrice = (price: number, unit: string) => {
    const formatted = new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price).replace('€', '€ ');
    switch (unit) {
      case "per_month": return `${formatted}/month`;
      case "per_week": return `${formatted}/week`;
      default: return formatted;
    }
  };

  const overviewMetrics: OverviewMetric[] = [
    {
      key: "property-type",
      label: t("categoryLayouts.common.type"),
      value: translateCategoryValue(t, propertyType) ?? t("categoryLayouts.realEstate.propertyFallback"),
      icon: Home,
    },
    ...(bedrooms !== undefined
      ? [{
          key: "bedrooms",
          label: t("categoryLayouts.realEstate.bedrooms"),
          value: String(bedrooms),
          icon: Bed,
        }]
      : []),
    ...(bathrooms !== undefined
      ? [{
          key: "bathrooms",
          label: t("categoryLayouts.realEstate.bathrooms"),
          value: String(bathrooms),
          icon: Bath,
        }]
      : []),
    ...(propertySizeM2
      ? [{
          key: "living-area",
          label: t("categoryLayouts.realEstate.livingArea"),
          value: `${propertySizeM2} m²`,
          icon: Maximize,
        }]
      : []),
    ...(plotSizeM2
      ? [{
          key: "plot-size",
          label: t("categoryLayouts.realEstate.plotSize"),
          value: `${plotSizeM2} m²`,
          icon: MapPin,
        }]
      : []),
    ...(transactionType
      ? [{
          key: "available-for",
          label: t("categoryLayouts.realEstate.availableFor"),
          value: transactionType === "both"
            ? t("categoryLayouts.realEstate.saleAndRent")
            : translateCategoryValue(t, transactionType),
          icon: Euro,
        }]
      : []),
    ...(seaView
      ? [{
          key: "sea-view",
          label: t("categoryLayouts.realEstate.premiumFeatures"),
          value: t("categoryLayouts.realEstate.seaView"),
          icon: Waves,
        }]
      : []),
    ...(golfFront
      ? [{
          key: "golf-front",
          label: t("categoryLayouts.realEstate.premiumFeatures"),
          value: t("categoryLayouts.realEstate.golfFront"),
          icon: TreePine,
        }]
      : []),
    ...(gatedCommunity
      ? [{
          key: "gated-community",
          label: t("categoryLayouts.realEstate.premiumFeatures"),
          value: t("categoryLayouts.realEstate.gatedCommunity"),
          icon: Shield,
        }]
      : []),
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.realEstate.propertyOverview")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {overviewMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.key} className="luxury-card p-4 text-center">
                <Icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-body-sm text-muted-foreground">{metric.label}</p>
                <p className="text-body-md font-medium capitalize">{metric.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {price && (
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-body-sm text-muted-foreground">
                {transactionType === 'rent' ? t("categoryLayouts.realEstate.rentalPrice") : t("categoryLayouts.realEstate.askingPrice")}
              </p>
              <p className="text-3xl font-serif font-medium text-primary">{formatPrice(price, priceUnit)}</p>
            </div>
            {onInquire ? (
              <div className="flex gap-3">
                <Button size="lg" onClick={onInquire}>
                  <Calendar className="h-4 w-4 mr-2" />
                  {t("categoryLayouts.realEstate.scheduleViewing")}
                </Button>
              </div>
            ) : null}
          </div>
        </Card>
      )}
    </div>
  );
}
