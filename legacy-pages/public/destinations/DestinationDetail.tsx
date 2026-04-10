import Link from "next/link";
import { useParams } from "next/navigation";
import { m } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, MapPin, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { CuratedExcellence } from "@/components/sections/CuratedExcellence";
import { GoogleRatingBadge } from "@/components/ui/google-rating-badge";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { translateCategoryName } from "@/lib/translateCategory";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { useLocalePath } from "@/hooks/useLocalePath";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import {
  buildAbsoluteRouteUrl,
  buildStaticRouteData,
  buildUniformLocalizedSlugMap,
} from "@/lib/i18n/localized-routing";
import ListingTierBadge from "@/components/ui/ListingTierBadge";
import { CmsBlock } from "@/components/cms/CmsBlock";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";

export default function DestinationDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const locale = useCurrentLocale();
  const l = useLocalePath();
  const { isBlockEnabled } = useCmsPageBuilder("destination-detail");

  // Fetch region by slug
  const { data: region, isLoading: regionLoading } = useQuery({
    queryKey: ['region', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('slug', slug)
        .or('is_active.eq.true,is_visible_destinations.eq.true')
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fetch cities in this region
  const { data: regionCities = [] } = useQuery({
    queryKey: ['region-cities', region?.id],
    queryFn: async () => {
      if (!region?.id) return [];
      const { data, error } = await supabase
        .from('city_region_mapping')
        .select('city:cities(*)')
        .eq('region_id', region.id);
      if (error) throw error;
      return data.map(d => d.city).filter(Boolean);
    },
    enabled: !!region?.id,
  });

  // Fetch listings for this region
  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['region-listings', region?.id],
    queryFn: async () => {
      if (!region?.id) return [];
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          city:cities(name),
          category:categories(name, icon, slug)
        `)
        .eq('region_id', region.id)
        .eq('status', 'published')
        .order('is_curated', { ascending: false })
        .order('tier', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!region?.id,
  });

  if (regionLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!region) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-20 text-center app-container">
          <h1 className="text-title font-serif text-foreground mb-4">
            Destination Not Found
          </h1>
          <p className="text-body text-muted-foreground mb-8">
            The destination you're looking for doesn't exist.
          </p>
          <Link
            href={l("/destinations")}
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Destinations
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-cms-page="destination-detail">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: buildAbsoluteRouteUrl(locale, buildStaticRouteData("home")) },
          {
            name: "Destinations",
            url: buildAbsoluteRouteUrl(locale, buildStaticRouteData("destinations")),
          },
          {
            name: region.name,
            url: buildAbsoluteRouteUrl(locale, {
              routeType: "destination",
              slugs: buildUniformLocalizedSlugMap(region.slug),
            }),
          },
        ]}
        locale={locale}
      />
      <Header />
      {!isBlockEnabled("hero", true) && <div className="h-[4.5rem] sm:h-20" aria-hidden="true" />}

      {/* Hero Section */}
      {isBlockEnabled("hero", true) && <CmsBlock pageId="destination-detail" blockId="hero" as="section" className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {region.hero_image_url || region.image_url ? (
            <img
              src={region.hero_image_url || region.image_url}
              alt={region.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-charcoal-light to-charcoal" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
        </div>

        <div className="relative app-container content-max">
          {/* Breadcrumb */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Link
              href={l("/destinations")}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Destinations
            </Link>
          </m.div>

          <m.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-block text-sm font-medium text-primary tracking-[0.3em] uppercase mb-4"
          >
            Premium Region
          </m.span>

          <m.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-hero font-serif font-medium text-foreground mb-6"
          >
            {region.name}
          </m.h1>

          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-body text-foreground/80 readable mb-8"
          >
            {region.description || region.short_description}
          </m.p>

          {/* Cities in Region */}
          {regionCities.length > 0 && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              {regionCities.map((city: any) => (
                <Link
                  key={city.id}
                  href={l({
                    routeType: "city",
                    citySlugs: buildUniformLocalizedSlugMap(city.slug),
                  })}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border border-border text-sm text-foreground hover:bg-primary/10 hover:border-primary/30 transition-colors tap-target"
                >
                  <MapPin className="w-3 h-3 text-primary" />
                  {city.name}
                </Link>
              ))}
            </m.div>
          )}
        </div>
      </CmsBlock>}

      {/* Signature Selection Section - ONE per page, context-aware */}
      {isBlockEnabled("curated", true) && <CmsBlock pageId="destination-detail" blockId="curated">
        <CuratedExcellence context={{ type: 'region', regionId: region.id }} limit={3} />
      </CmsBlock>}

      {/* Listings Section */}
      {isBlockEnabled("listings", true) && <CmsBlock pageId="destination-detail" blockId="listings" as="section" className="py-16 lg:py-24">
        <div className="app-container content-max density">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-title font-serif font-medium text-foreground">
                Explore {region.name}
              </h2>
              <p className="mt-2 text-body text-muted-foreground">
                {listings.length} premium listings in this region
              </p>
            </div>
          </m.div>

          {listingsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : listings.length > 0 ? (
            <div className="grid-adaptive grid-ultrawide">
              {listings.map((listing, index) => (
                <m.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link
                    href={l({
                      routeType: "listing",
                      slugs: buildUniformLocalizedSlugMap(listing.slug || listing.id),
                    })}
                    className="group block"
                  >
                    <article className="luxury-card overflow-hidden flex flex-col h-full hoverable">
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <ImageWithFallback
                          src={listing.featured_image_url}
                          alt={listing.name}
                          containerClassName="w-full h-full"
                          fallbackIconSize={48}
                          className="transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Badges - Top Left */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                          <ListingTierBadge tier={listing.tier} />
                        </div>

                        {/* Google Reviews - Top Right */}
                        {listing.google_rating && (
                          <GoogleRatingBadge
                            rating={listing.google_rating}
                            reviewCount={listing.google_review_count}
                            variant="overlay"
                            size="sm"
                            className="absolute top-3 right-3"
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 text-caption text-muted-foreground mb-2">
                          <span>{translateCategoryName(t, listing.category?.slug, listing.category?.name)}</span>
                          {listing.city && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {listing.city.name}
                              </span>
                            </>
                          )}
                        </div>

                        <h3 className="font-serif text-lg font-medium text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {listing.name}
                        </h3>

                        <p className="text-caption text-muted-foreground line-clamp-2 mb-4 flex-1">
                          {listing.short_description || listing.description}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                          <span className="text-sm font-medium text-primary">
                            View Details
                          </span>
                          <ArrowRight className="w-4 h-4 text-primary opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                        </div>
                      </div>
                    </article>
                  </Link>
                </m.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <MapPin className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-title font-serif text-foreground mb-2">
                No Listings Yet
              </h3>
              <p className="text-body text-muted-foreground mb-6">
                We're selecting the finest experiences for this region.
              </p>
              <Link
                href={l(buildStaticRouteData("destinations"))}
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                Explore Other Destinations
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </CmsBlock>}

      {/* Other Regions CTA */}
      {isBlockEnabled("faq", true) && <CmsBlock pageId="destination-detail" blockId="faq" as="section" className="py-16 lg:py-24 bg-card">
        <div className="app-container text-center" style={{ maxWidth: '56rem' }}>
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-title font-serif font-medium text-foreground mb-4">
              Explore More Destinations
            </h2>
            <p className="text-body text-muted-foreground mb-8 readable mx-auto">
              Discover other prestigious regions across the Algarve
            </p>
            <Link
              href={l(buildStaticRouteData("destinations"))}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors tap-target"
            >
              View All Destinations
              <ArrowRight className="w-4 h-4" />
            </Link>
          </m.div>
        </div>
      </CmsBlock>}

      <Footer />
    </div>
  );
}
