import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Loader2, MapPinned } from "lucide-react";
import { useMemo } from "react";

import type { MapListingPoint } from "@/components/map/ListingsLeafletMap";
import { Button } from "@/components/ui/Button";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useSignatureListings } from "@/hooks/useListings";
import { useHydrated } from "@/hooks/useHydrated";
import { translateCategoryName } from "@/lib/translateCategory";
import { useTranslation } from "react-i18next";

const ListingsLeafletMap = dynamic(
  () => import("@/components/map/ListingsLeafletMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] w-full rounded-[1.75rem] bg-muted/35 animate-pulse" />
    ),
  }
);

export function SignatureMapSection() {
  const { t } = useTranslation();
  const l = useLocalePath();
  const hydrated = useHydrated();
  const { data: signatureListings = [], isLoading } = useSignatureListings();

  const mapPoints = useMemo<MapListingPoint[]>(
    () =>
      signatureListings
        .map<MapListingPoint | null>((listing) => {
          const latitude = Number(listing.latitude ?? listing.city?.latitude ?? NaN);
          const longitude = Number(listing.longitude ?? listing.city?.longitude ?? NaN);
          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

          return {
            id: listing.id,
            name: listing.name,
            slug: listing.slug,
            latitude,
            longitude,
            categorySlug: listing.category?.slug,
            categoryName: translateCategoryName(t, listing.category?.slug, listing.category?.name),
            categoryImageUrl: listing.category?.image_url,
            cityName: listing.city?.name ?? "Algarve",
            tier: listing.tier,
            featuredImageUrl: listing.featured_image_url,
            priceFrom: listing.price_from,
            priceCurrency: listing.price_currency,
            href: l(`/listing/${listing.slug}`),
          } satisfies MapListingPoint;
        })
        .filter((point): point is MapListingPoint => point !== null)
        .slice(0, 240),
    [l, signatureListings, t]
  );

  return (
    <section id="explore-map" className="bg-background py-20 sm:py-24 lg:py-28">
      <div className="app-container content-max">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              <MapPinned className="h-4 w-4" />
              Explore on Map
            </span>
            <h2 className="mt-4 font-serif text-3xl font-medium tracking-normal text-foreground sm:text-4xl">
              Search the Algarve by location
            </h2>
            <p className="mt-4 text-body text-muted-foreground">
              Move from curated inspiration to a geographic search view with clustered markers and area-based filtering.
            </p>
          </div>

          <Link href={l("/map")} className="w-full sm:w-auto">
            <Button variant="gold" size="lg" className="w-full gap-2 sm:w-auto">
              Search by location
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] bg-black shadow-elevated">
          {isLoading ? (
            <div className="flex h-[420px] items-center justify-center bg-muted/30">
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                {t("sections.vip.discovery.loadingMap")}
              </span>
            </div>
          ) : hydrated ? (
            <ListingsLeafletMap
              points={mapPoints}
              enableClustering
              showPopups={false}
              autoFit
              scrollWheelZoom={false}
              mapClassName="h-[420px]"
              emptyMessage="No mapped signature places yet."
            />
          ) : (
            <div className="h-[420px] w-full bg-muted/35 animate-pulse" />
          )}
        </div>
      </div>
    </section>
  );
}

export default SignatureMapSection;
