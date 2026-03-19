
import { Link } from "@/components/router/nextRouterCompat";
import { Database } from "@/integrations/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Bath, Maximize, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { translateCategoryValue } from "@/lib/translateCategoryValue";
import ListingImage from "@/components/ListingImage";
import { buildLangPath, useLangPrefix } from "@/hooks/useLangPrefix";
import ListingTierBadge from "@/components/ui/ListingTierBadge";

type Listing = Pick<
    Database["public"]["Tables"]["listings"]["Row"],
    "id" | "slug" | "name" | "price_from" | "featured_image_url" | "category_data" | "tier" | "short_description"
> & {
    cities: { name: string; slug: string } | null;
};

interface RealEstateCardProps {
    listing: Listing;
}

export function RealEstateCard({ listing }: RealEstateCardProps) {
    const { t } = useTranslation();
    const langPrefix = useLangPrefix();
    const {
        id,
        name,
        price_from,
        featured_image_url,
        category_data,
        slug
    } = listing;

    const data = category_data as Record<string, any> || {};
    const beds = data.bedrooms || 0;
    const baths = data.bathrooms || 0;
    const area = data.property_size_m2 || data.area_sqm || 0;
    const plotSize = data.plot_size_m2 || data.plot_sqm || 0;
    const propertyType = data.property_type || "property";

    const formatMetricValue = (value: number) =>
        new Intl.NumberFormat("en-GB", {
            maximumFractionDigits: 1,
        }).format(value);

    const propertyMetrics = [
        ...(beds > 0
            ? [{
                key: "bedrooms",
                value: formatMetricValue(beds),
                unit: null,
                label: t("listing.bedrooms"),
                icon: Building2,
            }]
            : []),
        ...(baths > 0
            ? [{
                key: "bathrooms",
                value: formatMetricValue(baths),
                unit: null,
                label: t("listing.bathrooms"),
                icon: Bath,
            }]
            : []),
        ...(area > 0
            ? [{
                key: "living-area",
                value: formatMetricValue(area),
                unit: "m²",
                label: t("listing.livingArea", "Living Area"),
                icon: Maximize,
            }]
            : []),
        ...(plotSize > 0
            ? [{
                key: "plot-size",
                value: formatMetricValue(plotSize),
                unit: "m²",
                label: t("listing.plotSize"),
                icon: MapPin,
            }]
            : []),
    ];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-EU', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0,
        }).format(price).replace('€', '€ ');
    };

    return (
        <Link href={buildLangPath(langPrefix, `/listing/${slug || id}`)} className="block h-full">
            <Card className="overflow-hidden group relative isolate hover:shadow-2xl transition-all duration-700 border border-border/50 bg-card rounded-[2rem] shadow-lg shadow-black/5 flex flex-col h-full">
                {listing.tier === "signature" && (
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] border-[2px] border-[hsl(43,86%,58%)] shadow-[0_0_10px_hsla(43,86%,58%,0.34)]"
                    />
                )}

                <div className="relative aspect-[16/11] overflow-hidden">
                    <ListingImage
                        src={featured_image_url}
                        category={data.slug || 'real-estate'}
                        categoryImageUrl={data.image_url || data.category_image_url || null}
                        listingId={id}
                        alt={name}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                        {(listing.tier === "signature" || listing.tier === "verified") && (
                            <ListingTierBadge tier={listing.tier} />
                        )}
                        {listing.tier === "signature" && (
                            <ListingTierBadge tier="verified" />
                        )}
                        <Badge variant="secondary" className="backdrop-blur-xl bg-background/70 text-foreground font-semibold tracking-wider text-body-xs uppercase px-3 py-1 border border-white/10">
                            {translateCategoryValue(t, propertyType)}
                        </Badge>
                    </div>

                    <div className="absolute top-6 right-6">
                        <Button size="icon" variant="ghost" className="rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md border border-white/10 transition-all group/fav" onClick={(e) => {
                            e.preventDefault();
                            // Toggle favorite
                        }}>
                            <Heart className="w-5 h-5 group-hover/fav:fill-white transition-all" />
                        </Button>
                    </div>

                    <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 max-w-[calc(100%-2rem)] sm:max-w-none">
                        <div className="bg-card px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-xl shadow-black/10 border border-primary/10">
                            <p className="text-card-foreground font-serif italic text-base sm:text-lg truncate">{price_from ? formatPrice(price_from) : t("listing.priceOnRequest")}</p>
                        </div>
                    </div>
                </div>

                <CardContent className="p-5 sm:p-8 space-y-4 flex flex-col flex-1">
                    <div className="flex-1">
                        <div className="flex items-center text-primary text-body-xs tracking-[0.2em] font-bold uppercase mb-2">
                            <MapPin className="w-3 h-3 mr-2" />
                            {listing.cities?.name || "Algarve"}
                        </div>
                        <h3 className="min-h-[3.5rem] font-serif text-xl sm:text-2xl font-light italic text-foreground group-hover:text-primary transition-colors leading-tight mb-4 line-clamp-2">
                            {name}
                        </h3>
                        <p className="text-body-sm text-muted-foreground font-light leading-relaxed mb-6">
                            {listing.short_description || "An exceptional property offering unparalleled premium quality and sophistication in Portugal's finest location."}
                        </p>
                    </div>

                    {propertyMetrics.length > 0 && (
                        <div className="pt-5 sm:pt-6 border-t border-border/50">
                            <div className="grid grid-cols-2 gap-3">
                                {propertyMetrics.map((metric, index) => {
                                    const Icon = metric.icon;
                                    const isLastOddCard = propertyMetrics.length % 2 === 1 && index === propertyMetrics.length - 1;

                                    return (
                                        <div
                                            key={metric.key}
                                            className={`rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.08] via-card to-card px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] ${isLastOddCard ? "col-span-2" : ""}`}
                                        >
                                            <div className="flex h-full items-start gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary shadow-sm">
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-serif text-[1.1rem] sm:text-[1.2rem] font-semibold text-foreground leading-none">
                                                        {metric.value}
                                                        {metric.unit ? (
                                                            <span className="ml-1 text-[0.82rem] sm:text-[0.9rem] font-medium text-muted-foreground">
                                                                {metric.unit}
                                                            </span>
                                                        ) : null}
                                                    </p>
                                                    <p className="mt-2 text-[0.7rem] sm:text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground leading-tight">
                                                        {metric.label}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
