import Link from "next/link";
import { useParams } from "next/navigation";
import { m } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, MapPin, Building2, Loader2, Crown } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { useSavedDestinations } from "@/hooks/useSavedDestinations";
import { useFavoriteListings } from "@/hooks/useFavoriteListings";
import { GoogleRatingBadge } from "@/components/ui/google-rating-badge";
import { CuratedExcellence } from "@/components/sections/CuratedExcellence";
import { supabase } from "@/integrations/supabase/client";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { useLocalePath } from "@/hooks/useLocalePath";
import {
  buildAbsoluteRouteUrl,
  buildStaticRouteData,
  buildUniformLocalizedSlugMap,
} from "@/lib/i18n/localized-routing";
import ListingTierBadge from "@/components/ui/ListingTierBadge";
import { CmsBlock } from "@/components/cms/CmsBlock";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";

export default function CityDetail() {
  const { slug } = useParams<{ slug: string }>();
  const locale = useCurrentLocale();
  const l = useLocalePath();
  const { isBlockEnabled } = useCmsPageBuilder("city-detail");
  const { isDestinationSaved, toggleCity } = useSavedDestinations();
  const { isFavorite, toggleFavorite } = useFavoriteListings();

  // Fetch city by slug
  const { data: city, isLoading: cityLoading } = useQuery({
    queryKey: ['city', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fetch region for this city
  const { data: cityRegion } = useQuery({
    queryKey: ['city-region', city?.id],
    queryFn: async () => {
      if (!city?.id) return null;
      const { data, error } = await supabase
        .from('city_region_mapping')
        .select('region:regions(*)')
        .eq('city_id', city.id)
        .eq('is_primary', true)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data?.region || null;
    },
    enabled: !!city?.id,
  });

  // Fetch listings for this city
  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['city-listings', city?.id],
    queryFn: async () => {
      if (!city?.id) return [];
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          category:categories(name, slug)
        `)
        .eq('city_id', city.id)
        .eq('status', 'published')
        .order('is_curated', { ascending: false })
        .order('tier', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!city?.id,
  });

  if (cityLoading) {
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

  if (!city) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-20 text-center app-container">
          <h1 className="text-title font-serif text-foreground mb-4">
            City Not Found
          </h1>
          <p className="text-body text-muted-foreground mb-8">
            The city you're looking for doesn't exist.
          </p>
          <Link
            href={l("/")}
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-cms-page="city-detail">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: buildAbsoluteRouteUrl(locale, buildStaticRouteData("home")) },
          {
            name: "Destinations",
            url: buildAbsoluteRouteUrl(locale, buildStaticRouteData("destinations")),
          },
          {
            name: city.name,
            url: buildAbsoluteRouteUrl(locale, {
              routeType: "city",
              citySlugs: buildUniformLocalizedSlugMap(city.slug),
            }),
          },
        ]}
        locale={locale}
      />
      <Header />
      {!isBlockEnabled("hero", true) && <div className="h-[4.5rem] sm:h-20" aria-hidden="true" />}

      {/* Hero Section */}
      {isBlockEnabled("hero", true) && <CmsBlock pageId="city-detail" blockId="hero" as="section" className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        {/* Background Image */}
        {(city.hero_image_url || city.image_url) && (
          <div className="absolute inset-0">
            <img
              src={city.hero_image_url || city.image_url}
              alt={city.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Gradient Overlay - always visible for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal-light/95 via-background/90 to-charcoal/95">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="relative app-container content-max">
          {/* Breadcrumb */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex items-center justify-between"
          >
            <Link
              href={l(buildStaticRouteData("home"), { hash: "cities" })}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cities
            </Link>
            
            {/* Favorite Button */}
            <FavoriteButton
              isFavorite={isDestinationSaved('city', city.slug)}
              onToggle={() => toggleCity(city.slug)}
              size="lg"
              variant="glassmorphism"
            />
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-3 mb-4"
          >
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary tracking-[0.3em] uppercase">
              Algarve, Portugal
            </span>
          </m.div>

          <m.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-hero font-serif font-medium text-foreground mb-6"
          >
            {city.name}
          </m.h1>

          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-body text-foreground/80 readable mb-8"
          >
            {city.description || `Discover premium listings in ${city.name}, one of the Algarve's most sought-after destinations.`}
          </m.p>

          {/* Region Tag */}
          {cityRegion && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link
                href={l({
                  routeType: "destination",
                  slugs: buildUniformLocalizedSlugMap(cityRegion.slug),
                })}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary hover:bg-primary/20 transition-colors"
              >
                <Crown className="w-4 h-4" />
                Part of {cityRegion.name}
                <ArrowRight className="w-3 h-3" />
              </Link>
            </m.div>
          )}
        </div>
      </CmsBlock>}

      {/* Signature Selection Section - ONE per page, context-aware */}
      {isBlockEnabled("curated", true) && <CmsBlock pageId="city-detail" blockId="curated">
        <CuratedExcellence context={{ type: 'city', cityId: city.id }} limit={3} />
      </CmsBlock>}

      {/* Listings Section */}
      {isBlockEnabled("listings", true) && <CmsBlock pageId="city-detail" blockId="listings" as="section" className="py-16 lg:py-24">
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
                Explore {city.name}
              </h2>
              <p className="mt-2 text-body text-muted-foreground">
                {listings.length} premium listings in this city
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
                    <article className="premium-card overflow-hidden flex flex-col h-full hoverable">
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

                        {/* Bottom - Category & Favorite */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs bg-black/60 backdrop-blur-sm">
                            {listing.category?.name}
                          </Badge>
                          <FavoriteButton
                            isFavorite={isFavorite(listing.id)}
                            onToggle={() => toggleFavorite(listing.id)}
                            size="sm"
                            variant="glassmorphism"
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col">
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
                We're selecting the finest experiences for this city.
              </p>
              <Link
                href={l(buildStaticRouteData("home"))}
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                Explore All Listings
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </CmsBlock>}

      {/* Other Cities CTA */}
      {isBlockEnabled("faq", true) && <CmsBlock pageId="city-detail" blockId="faq" as="section" className="py-16 lg:py-24 bg-card">
        <div className="app-container text-center" style={{ maxWidth: '56rem' }}>
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-title font-serif font-medium text-foreground mb-4">
              Explore More Cities
            </h2>
            <p className="text-body text-muted-foreground mb-8 readable mx-auto">
              Discover other vibrant cities across the Algarve
            </p>
            <Link
              href={l(buildStaticRouteData("home"), { hash: "cities" })}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors tap-target"
            >
              View All Cities
              <ArrowRight className="w-4 h-4" />
            </Link>
          </m.div>
        </div>
      </CmsBlock>}

      <Footer />
    </div>
  );
}
