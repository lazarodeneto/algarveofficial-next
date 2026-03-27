import { motion } from "framer-motion";
import { Crown, Loader2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { GoogleRatingBadge } from "@/components/ui/google-rating-badge";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { useFavoriteListings } from "@/hooks/useFavoriteListings";
import { useCuratedAssignments } from "@/hooks/useCuratedAssignments";
import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/hooks/useLocalePath";
import { translateCategoryName } from "@/lib/translateCategory";
import { supabase } from "@/integrations/supabase/client";
import ListingImage from "@/components/ListingImage";
import ListingTierBadge from "@/components/ui/ListingTierBadge";

export type CuratedContext = {
  type: 'home';
} | {
  type: 'region';
  regionId: string;
} | {
  type: 'category';
  categoryId: string;
} | {
  type: 'city';
  cityId: string;
};

interface CuratedExcellenceProps {
  context: CuratedContext;
  limit?: number; // 3-6 items, defaults to 3
  showSectionHeader?: boolean;
}

type Lang = "en" | "pt-pt" | "fr" | "de" | "es" | "it" | "nl" | "sv" | "no" | "da";

const normalizeLang = (raw?: string | null): Lang => {
  if (!raw) return "en";
  const v = raw.toLowerCase().replace("_", "-").trim();
  if (v === "pt" || v === "pt-pt" || v === "pt_pt") return "pt-pt";
  if (v.startsWith("fr")) return "fr";
  if (v.startsWith("de")) return "de";
  if (v.startsWith("es")) return "es";
  if (v.startsWith("it")) return "it";
  if (v.startsWith("nl")) return "nl";
  if (v.startsWith("sv")) return "sv";
  if (v === "no" || v.startsWith("nb") || v.startsWith("nn")) return "no";
  if (v.startsWith("da")) return "da";
  return "en";
};

/**
 * Signature Selection Component
 * 
 * A reusable, context-aware component that displays hand-selected signature listings.
 * Rules:
 * - Maximum ONE instance per page
 * - Fetches listings from curated_assignments table (admin-assigned)
 * - Falls back to homepage assignment if no context-specific assignment exists
 * - Never paginate - strict limit of 3-6 items
 */
export function CuratedExcellence({
  context,
  limit = 3,
  showSectionHeader = true
}: CuratedExcellenceProps) {
  const { t, i18n } = useTranslation();
  const l = useLocalePath();
  const { isFavorite, toggleFavorite } = useFavoriteListings();
  const targetLang = normalizeLang(i18n.language);

  // Determine context_type and context_id for the query
  const contextType = context.type === 'home' ? 'homepage' : context.type;
  const contextId = context.type === 'home' ? null :
    context.type === 'region' ? context.regionId :
      context.type === 'category' ? context.categoryId :
        context.type === 'city' ? context.cityId : null;

  const { data: curatedListings = [], isLoading } = useCuratedAssignments(contextType, contextId, limit);
  const listingIds = useMemo(() => curatedListings.map((listing) => listing.id), [curatedListings]);

  const { data: translationRows } = useQuery({
    queryKey: ["curated-excellence-translations", targetLang, listingIds],
    queryFn: async () => {
      if (!listingIds.length || targetLang === "en") return [];
      const { data, error } = await supabase
        .from("listing_translations")
        .select("listing_id, title, short_description")
        .in("listing_id", listingIds)
        .eq("language_code", targetLang);

      if (error) throw error;
      return data || [];
    },
    enabled: listingIds.length > 0 && targetLang !== "en",
  });

  if (isLoading) {
    return (
      <section id="curated-excellence" className="py-24 bg-background relative overflow-hidden lg:py-[40px]">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  // FALLBACK RULE: If no curated listings exist, render nothing
  if (curatedListings.length === 0) {
    return null;
  }

  const translationMap = new Map(
    (translationRows || []).map((tr) => [
      tr.listing_id,
      {
        title: tr.title?.trim(),
        short_description: tr.short_description?.trim(),
      },
    ]),
  );

  const displayListings = curatedListings.map((listing) => {
    const tr = translationMap.get(listing.id);
    if (!tr) return listing;
    return {
      ...listing,
      name: tr.title || listing.name,
      short_description: tr.short_description || listing.short_description,
    };
  });

  // For single featured listing display
  const featuredListing = displayListings[0];

  return (
    <section id="curated-excellence" className="py-24 bg-background relative overflow-hidden lg:py-[40px]">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/[0.02] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/[0.02] rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="relative app-container">
        {/* Section Header */}
        {showSectionHeader && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">{t('sections.curated.badge')}</span>
            </div>
            <h2 className="text-hero font-serif font-medium text-foreground">{t('sections.curated.title')}</h2>
            <p className="mt-6 text-body lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed readable">
              {t('sections.curated.subtitle')}
            </p>
          </motion.div>
        )}

        {/* Featured Listing Card */}
          <Link href={l(`/listing/${featuredListing.slug}`)} className="block">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="group relative flex flex-col md:flex-row overflow-hidden glass-box glass-box-listing-shimmer glass-box-contour cursor-pointer transition-all duration-500 hover:border-primary/40 hover:shadow-[0_0_26px_rgba(172,184,198,0.28),0_0_52px_rgba(172,184,198,0.14)]"
          >
            {/* Gold accent border on left */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[hsl(43,74%,49%)] via-[hsl(43,80%,35%)] to-[hsl(43,74%,49%)] rounded-l-lg z-10" />

            {/* Image */}
            <div className="md:w-2/5 h-64 md:h-80 overflow-hidden relative">
              <ListingImage
                src={featuredListing.featured_image_url}
                category={featuredListing.category?.slug}
                categoryImageUrl={featuredListing.category?.image_url}
                listingId={featuredListing.id}
                alt={featuredListing.name}
                className="absolute inset-0 w-full h-full object-cover scale-[1.08] transition-transform duration-500 group-hover:scale-110"
              />

              {/* Favorite Button - Top Left of Image */}
              <div className="absolute top-3 left-3 z-10" onClick={e => e.preventDefault()}>
                <FavoriteButton
                  isFavorite={isFavorite(featuredListing.id)}
                  onToggle={() => toggleFavorite(featuredListing.id)}
                  size="md"
                  variant="glassmorphism"
                />
              </div>

              {/* Google Reviews - Top Right */}
              {featuredListing.google_rating && (
                <GoogleRatingBadge
                  rating={featuredListing.google_rating}
                  reviewCount={featuredListing.google_review_count}
                  variant="overlay"
                  size="sm"
                  className="absolute top-3 right-3"
                />
              )}
            </div>

            {/* Content */}
            <div className="md:w-3/5 p-6 lg:p-10 flex flex-col justify-center relative z-10">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {/* Badge */}
                <ListingTierBadge tier="signature" />
                {/* Location & Category */}
                <span className="text-sm text-primary font-medium uppercase tracking-wider group-hover:text-black dark:group-hover:text-white transition-colors">
                  {featuredListing.city?.name || 'Algarve'} · {translateCategoryName(t, featuredListing.category?.slug, featuredListing.category?.name) || 'Experience'}
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif font-medium text-foreground mb-3 group-hover:text-primary transition-colors">
                {featuredListing.name}
              </h3>

              <p className="text-base lg:text-lg text-muted-foreground mb-6 max-w-lg leading-relaxed line-clamp-2 dark:group-hover:text-white transition-colors">
                {featuredListing.short_description || featuredListing.description}
              </p>

              {/* CTA */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-primary font-medium group-hover:underline">
                  {t('sections.curated.viewDetails')} →
                </span>
              </div>
            </div>
          </motion.div>
        </Link>
      </div>
    </section>
  );
}
