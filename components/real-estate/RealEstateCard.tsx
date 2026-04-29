
import Link from "next/link";
import { Database } from "@/integrations/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Bath, Maximize, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "react-i18next";
import { translateCategoryValue } from "@/lib/translateCategoryValue";
import ListingImage from "@/components/ListingImage";
import { useLocalePath } from "@/hooks/useLocalePath";
import ListingTierBadge from "@/components/ui/ListingTierBadge";
import { cn } from "@/lib/utils";
import {
  getTierCardClasses,
  getTierImageZoom,
  getTierImageOverlay,
  getTierTitleClasses,
  getTierSpacing,
  isPremiumTier,
} from "@/lib/tier-design";

type Listing = Pick<
    Database["public"]["Tables"]["listings"]["Row"],
    "id" | "slug" | "name" | "price_from" | "featured_image_url" | "category_data" | "tier" | "short_description"
> & {
    cities: { name: string; slug: string } | null;
};

interface RealEstateCardProps {
    listing: Listing;
}

function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};
}

function asNumber(value: unknown): number {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}

function asString(value: unknown): string | null {
    return typeof value === "string" && value.trim().length > 0 ? value : null;
}

export function RealEstateCard({ listing }: RealEstateCardProps) {
    const { t } = useTranslation();
    const l = useLocalePath();
    const {
        id,
        name,
        price_from,
        featured_image_url,
        category_data,
        slug
    } = listing;

    const data = asRecord(category_data);
    const beds = asNumber(data.bedrooms);
    const baths = asNumber(data.bathrooms);
    const area = asNumber(data.property_size_m2) ?? asNumber(data.area_sqm);
    const plotSize = asNumber(data.plot_size_m2) ?? asNumber(data.plot_sqm);
    const propertyType = asString(data.property_type) ?? "property";
    const categorySlug = asString(data.slug) ?? "real-estate";
    const categoryImageUrl = asString(data.image_url) ?? asString(data.category_image_url);

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
                label: t("listing.livingArea"),
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

    const tierCardClass = getTierCardClasses(listing.tier);
    const tierImageZoom = getTierImageZoom(listing.tier);
    const tierTitleClass = getTierTitleClasses(listing.tier);
    const tierSpacing = getTierSpacing(listing.tier);
    const isPremium = isPremiumTier(listing.tier);
    const hasOverlay = listing.tier !== "unverified";

    return (
        <Link href={l(`/listing/${slug || id}`)} className="block h-full group">
            <Card className={cn(
                "overflow-hidden group relative isolate flex flex-col h-full",
                tierCardClass,
                isPremium && "ring-1 ring-inset ring-[#C7A35A]/20"
            )}>
                {isPremium && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#C7A35A]/60 to-transparent z-30" />
                )}

                <div className={cn("relative overflow-hidden", isPremium ? "aspect-[16/11]" : "aspect-[16/11]")}>
                    <ListingImage
                        src={featured_image_url}
                        category={categorySlug}
                        categoryImageUrl={categoryImageUrl}
                        listingId={id}
                        alt={name}
                        fill
                        className={cn(
                            "transition-transform duration-700 ease-out",
                            tierImageZoom
                        )}
                    />
                    {hasOverlay && (
                        <div className={cn(
                            "absolute inset-0 bg-gradient-to-t from-black/25 via-black/5 to-transparent transition-opacity duration-300",
                            listing.tier === "verified" ? "opacity-50 group-hover:opacity-70" : "opacity-60 group-hover:opacity-85"
                        )} />
                    )}
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                        <ListingTierBadge tier={listing.tier} />
                        <Badge
                            className="border border-white/70 bg-white/92 text-slate-900 shadow-[0_10px_24px_-16px_rgba(15,23,42,0.45)] backdrop-blur-xl font-semibold tracking-wider text-body-xs uppercase px-3.5 py-1.5 rounded-full dark:border-white/10 dark:bg-black/60 dark:text-white/95"
                        >
                            {translateCategoryValue(t, propertyType)}
                        </Badge>
                    </div>

                    <div className="absolute top-6 right-6">
                        <Button
                            size="icon"
                            variant="ghost"
                            className={cn(
                                "rounded-full backdrop-blur-md border transition-all duration-300",
                                isPremium
                                    ? "bg-[#C7A35A]/20 hover:bg-[#C7A35A] hover:text-black text-white border-white/20 hover:border-[#C7A35A]"
                                    : "bg-black/20 hover:bg-black/40 text-white border-white/10"
                            )}
                            aria-label={t("listing.saveToFavorites")}
                            onClick={(e) => {
                                e.preventDefault();
                            }}
                        >
                            <Heart className="w-5 h-5 group-hover/fav:fill-current transition-all" />
                        </Button>
                    </div>

                    <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 max-w-[calc(100%-2rem)] sm:max-w-none">
                        <div className={cn(
                            "backdrop-blur-md px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-xl border transition-all duration-300",
                            isPremium 
                                ? "bg-card/95 border-[#C7A35A]/30 text-card-foreground" 
                                : "bg-card/90 border-border/20 text-card-foreground"
                        )}>
                            <p className="font-serif italic text-base sm:text-lg font-light tracking-wide truncate">{price_from ? formatPrice(price_from) : t("listing.priceOnRequest")}</p>
                        </div>
                    </div>
                </div>

                <CardContent className={cn("flex flex-col flex-1 bg-card", tierSpacing.padding)}>
                    <div className="flex-1">
                        <div className={cn(
                            "flex items-center tracking-[0.2em] font-semibold uppercase mb-3",
                            isPremium ? "text-[#C7A35A]/90 text-body-xs" : "text-muted-foreground/70 text-body-xs"
                        )}>
                            <MapPin className="w-3.5 h-3.5 mr-2" />
                            {listing.cities?.name ?? "Algarve"}
                        </div>
                        <h3 className={cn(
                            "min-h-[4rem] sm:min-h-[4.5rem] font-serif leading-[1.16] sm:leading-[1.18] mb-4 line-clamp-2 break-words transition-colors duration-300 text-slate-950 dark:text-foreground",
                            tierTitleClass,
                            isPremium
                                ? "text-[1.45rem] sm:text-[1.72rem] font-medium tracking-[-0.02em] not-italic"
                                : "text-[1.35rem] sm:text-[1.58rem] font-medium tracking-[-0.02em]"
                        )}>
                            {name}
                        </h3>
                        <p className={cn(
                            "text-muted-foreground font-light leading-relaxed",
                            tierSpacing.gap === "gap-5" ? "mb-5" : "mb-4",
                            isPremium && "text-sm"
                        )}>
                            {listing.short_description ?? "An exceptional property offering unparalleled premium quality and sophistication in Portugal's finest location."}
                        </p>
                    </div>

                    {propertyMetrics.length > 0 && (
                        <div className={cn(
                            "border-t",
                            isPremium ? "pt-4 sm:pt-5 border-[#C7A35A]/20" : "pt-4 sm:pt-5 border-border/40"
                        )}>
                            <div className="grid grid-cols-4 gap-2">
                                {propertyMetrics.map((metric) => {
                                    const Icon = metric.icon;

                                    return (
                                        <div
                                            key={metric.key}
                                            className="flex flex-col items-center text-center gap-1.5 py-2"
                                        >
                                            <div className={cn(
                                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                                                isPremium
                                                    ? "border border-[#C7A35A]/20 bg-[#C7A35A]/10 text-[#C7A35A]"
                                                    : "border border-border/30 bg-muted/50 text-muted-foreground"
                                            )}>
                                                <Icon className="h-3.5 w-3.5" />
                                            </div>
                                            <div>
                                                <p className="text-[0.95rem] sm:text-[1.05rem] font-semibold text-foreground leading-none">
                                                    {metric.value}
                                                    {metric.unit ? (
                                                        <span className="ml-0.5 text-[0.72rem] sm:text-[0.78rem] font-medium text-muted-foreground">
                                                            {metric.unit}
                                                        </span>
                                                    ) : null}
                                                </p>
                                                <p className="mt-1 text-[0.6rem] sm:text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground leading-tight">
                                                    {metric.label}
                                                </p>
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
