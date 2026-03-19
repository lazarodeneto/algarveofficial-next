"use client";

import { motion } from "framer-motion";
import { Crown, Loader2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { GoogleRatingBadge } from "@/components/ui/google-rating-badge";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { useFavoriteListings } from "@/hooks/useFavoriteListings";
import { useCuratedAssignments } from "@/hooks/useCuratedAssignments";
import { useTranslation } from "react-i18next";
import { useLangPrefix, buildLangPath } from "@/hooks/useLangPrefix";
import { translateCategoryName } from "@/lib/translateCategory";
import { supabase } from "@/integrations/supabase/client";

import ListingImage from "@/components/ListingImage";
import ListingTierBadge from "@/components/ui/ListingTierBadge";

export type CuratedContext =
  | { type: "home" }
  | { type: "region"; regionId: string }
  | { type: "category"; categoryId: string }
  | { type: "city"; cityId: string };

interface CuratedExcellenceProps {
  context: CuratedContext;
  limit?: number;
  showSectionHeader?: boolean;
}

type Lang =
  | "en"
  | "pt-pt"
  | "fr"
  | "de"
  | "es"
  | "it"
  | "nl"
  | "sv"
  | "no"
  | "da";

const normalizeLang = (raw?: string | null): Lang => {
  if (!raw) return "en";
  const v = raw.toLowerCase().replace("_", "-").trim();
  if (v === "pt" || v === "pt-pt") return "pt-pt";
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

export function CuratedExcellence({
  context,
  limit = 3,
  showSectionHeader = true,
}: CuratedExcellenceProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { t, i18n } = useTranslation();
  const langPrefix = useLangPrefix();
  const { isFavorite, toggleFavorite } = useFavoriteListings();

  const targetLang = normalizeLang(i18n.language);

  const contextType =
    context.type === "home" ? "homepage" : context.type;

  const contextId =
    context.type === "home"
      ? null
      : context.type === "region"
        ? context.regionId
        : context.type === "category"
          ? context.categoryId
          : context.type === "city"
            ? context.cityId
            : null;

  // ✅ SAFE DEFAULT ARRAY
  const {
    data: curatedListings = [],
    isLoading,
  } = useCuratedAssignments(contextType, contextId, limit);

  const listingIds = useMemo(
    () => curatedListings.map((l) => l.id),
    [curatedListings]
  );

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

  const translationMap = new Map(
    (translationRows || []).map((tr) => [
      tr.listing_id,
      {
        title: tr.title?.trim(),
        short_description: tr.short_description?.trim(),
      },
    ])
  );

  const displayListings = curatedListings.map((listing) => {
    const tr = translationMap.get(listing.id);
    return {
      ...listing,
      name: tr?.title || listing.name,
      short_description:
        tr?.short_description || listing.short_description,
    };
  });

  const featuredListing = displayListings[0];

  if (!mounted) return null;

  return (
    <section
      id="curated-excellence"
      className="py-24 bg-background relative overflow-hidden lg:py-[40px]"
    >
      <div className="relative app-container">

        {/* HEADER */}
        {showSectionHeader && (
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {t("sections.curated.badge", { defaultValue: "Curated Excellence" })}
              </span>
            </div>

            <h2 className="text-hero font-serif font-medium text-foreground">
              {t("sections.curated.title", { defaultValue: "Handpicked Signature Experiences" })}
            </h2>

            <p className="mt-6 text-body text-muted-foreground max-w-3xl mx-auto">
              {t("sections.curated.subtitle", {
                defaultValue: "A rotating selection of our most distinctive places across the Algarve.",
              })}
            </p>
          </div>
        )}

        {/* CONTENT */}
        <div className="min-h-[300px] flex items-center justify-center">

          {isLoading && (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          )}

          {!isLoading && featuredListing && (
            <Link
              href={buildLangPath(
                langPrefix,
                `/listing/${featuredListing.slug}`
              )}
              className="block w-full max-w-5xl"
            >
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex flex-col md:flex-row overflow-hidden glass-box"
              >
                {/* IMAGE */}
                <div className="md:w-2/5 h-64 md:h-80 relative">
                  <ListingImage
                    src={featuredListing.featured_image_url}
                    category={featuredListing.category?.slug}
                    categoryImageUrl={featuredListing.category?.image_url}
                    listingId={featuredListing.id}
                    alt={featuredListing.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>

                {/* CONTENT */}
                <div className="md:w-3/5 p-6 flex flex-col justify-center">
                  <ListingTierBadge tier="signature" />

                  <h3 className="text-2xl font-serif text-foreground mt-3">
                    {featuredListing.name}
                  </h3>

                  <p className="text-muted-foreground mt-3 line-clamp-2">
                    {featuredListing.short_description}
                  </p>
                </div>
              </motion.div>
            </Link>
          )}

        </div>
      </div>
    </section>
  );
}
