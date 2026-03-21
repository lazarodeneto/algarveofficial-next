export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";
import { DirectoryClient } from "@/components/directory/DirectoryClient";
import { getDirectoryPageData } from "@/lib/directory-data";

interface LocaleDirectoryPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; city?: string; region?: string; category?: string; tier?: string }>;
}

function buildDirectoryMeta(
  locale: Locale,
  params: { q?: string; city?: string; region?: string; category?: string; tier?: string },
): { title: string; description: string; localizedPath: string } {
  const isSignature = params.tier === "signature";
  const hasSearch = Boolean(params.q?.trim());
  const hasCategory = Boolean(params.category);
  const hasCity = Boolean(params.city);
  const hasRegion = Boolean(params.region);
  const hasFilters = hasSearch || hasCategory || hasCity || hasRegion || isSignature;

  const localeMeta: Record<string, { base: string; category?: Record<string, string>; city?: Record<string, string>; tier?: string }> = {
    en: {
      base: "Premium Directory | AlgarveOfficial",
      category: {
        "places-to-stay": "Luxury Accommodation in the Algarve | AlgarveOfficial",
        restaurants: "Fine Dining & Restaurants in the Algarve | AlgarveOfficial",
        golf: "Golf Courses & Experiences in the Algarve | AlgarveOfficial",
        "things-to-do": "Things to Do in the Algarve | AlgarveOfficial",
        "beaches-clubs": "Beaches & Beach Clubs in the Algarve | AlgarveOfficial",
        "wellness-spas": "Wellness & Spas in the Algarve | AlgarveOfficial",
        "whats-on": "Events & What's On in the Algarve | AlgarveOfficial",
        "algarve-services": "Algarve Services & Experiences | AlgarveOfficial",
        "shopping-boutiques": "Shopping & Boutiques in the Algarve | AlgarveOfficial",
      },
      city: {
        "vilamoura": "Vilamoura Luxury Directory | AlgarveOfficial",
        "quinta-do-lago": "Quinta do Lago Premium Directory | AlgarveOfficial",
        "lagos": "Lagos Signature Directory | AlgarveOfficial",
        "albufeira": "Albufeira Premium Listings | AlgarveOfficial",
        "portimao": "Portimão Luxury Directory | AlgarveOfficial",
        "tavira": "Tavira Heritage Directory | AlgarveOfficial",
        "faro": "Faro City Guide & Directory | AlgarveOfficial",
      },
      tier: "Signature",
    },
    "pt-pt": {
      base: "Diretório Premium | AlgarveOfficial",
      category: {
        "places-to-stay": "Alojamento de Luxo no Algarve | AlgarveOfficial",
        restaurants: "Restaurantes de Prestígio no Algarve | AlgarveOfficial",
        golf: "Campos de Golfe no Algarve | AlgarveOfficial",
        "things-to-do": "Atividades no Algarve | AlgarveOfficial",
        "beaches-clubs": "Praias & Beach Clubs no Algarve | AlgarveOfficial",
      },
      city: {
        "vilamoura": "Diretório de Luxo Vilamoura | AlgarveOfficial",
        "quinta-do-lago": "Quinta do Lago Premium | AlgarveOfficial",
        "lagos": "Lagos Guia & Diretório | AlgarveOfficial",
        "albufeira": "Albufeira Premium | AlgarveOfficial",
      },
      tier: "Signature",
    },
    fr: {
      base: "Annuaire Premium | AlgarveOfficial",
    },
    de: {
      base: "Premium-Verzeichnis | AlgarveOfficial",
    },
    es: {
      base: "Directorio Premium | AlgarveOfficial",
    },
    nl: {
      base: "Premium Directory | AlgarveOfficial",
    },
  };

  const meta = localeMeta[locale] ?? localeMeta.en;

  if (!hasFilters) {
    return { title: meta.base, description: "", localizedPath: "/directory" };
  }

  const parts: string[] = [];

  if (isSignature) {
    parts.push(meta.tier ?? "Signature");
  }
  if (hasCategory) {
    const catTitle = meta.category?.[params.category!]?.split(" | ")[0];
    parts.push(catTitle ?? params.category!);
  } else if (hasSearch) {
    parts.push(`"${params.q}"`);
  }
  if (hasCity) {
    parts.push(params.city!.replace(/-/g, " "));
  } else if (hasRegion) {
    parts.push(params.region!.replace(/-/g, " "));
  }
  parts.push("Algarve");

  const title = `${parts.join(" in ")} | AlgarveOfficial`;

  const descriptions: Record<string, string> = {
    en: isSignature
      ? "Discover handpicked Signature partners — Algarve's most exclusive restaurants, villas, golf courses, and experiences."
      : hasSearch
        ? `Explore curated Algarve listings matching "${params.q}"`
        : hasCategory
          ? `Discover the finest ${params.category!.replace(/-/g, " ")} in the Algarve. Curated by local experts.`
          : hasCity
            ? `Discover ${params.city!.replace(/-/g, " ")}, Algarve — premium listings curated by local experts.`
            : `Discover the Algarve's finest ${params.category!.replace(/-/g, " ")}. Curated by experts.`,
  };

  const descs: Record<string, Record<string, string>> = {
    en: descriptions,
    "pt-pt": {
      en: "Descubra os melhores restaurantes, villas e experiências no Algarve.",
      signature: "Descubra parceiros Signature — os melhores restaurantes, villas e experiências exclusivas do Algarve.",
    },
    fr: { en: "Découvrez les meilleurs restaurants, villas et expériences de l'Algarve." },
    de: { en: "Entdecken Sie die besten Restaurants, Villen und Erlebnisse der Algarve." },
    es: { en: "Descubra los mejores restaurantes, villas y experiencias del Algarve." },
    nl: { en: "Ontdek de beste restaurants, villa's en ervaringen van de Algarve." },
  };

  const localeDescs = descs[locale] ?? descs.en;
  const description = isSignature
    ? localeDescs.signature ?? localeDescs.en
    : localeDescs.en;

  return { title, description, localizedPath: "/directory" };
}

export async function generateMetadata({ params, searchParams }: LocaleDirectoryPageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = (locale ?? DEFAULT_LOCALE) as Locale;
  const resolvedSearchParams = await searchParams;

  const { title, description, localizedPath } = buildDirectoryMeta(resolvedLocale, resolvedSearchParams);

  return buildPageMetadata({
    title,
    description: description || undefined,
    localizedPath,
    locale: resolvedLocale,
  });
}

export default async function LocaleDirectoryPage({ params, searchParams }: LocaleDirectoryPageProps) {
  const { locale } = await params;
  const resolvedLocale = (locale ?? DEFAULT_LOCALE) as Locale;
  const resolvedSearchParams = await searchParams;

  const data = await getDirectoryPageData(resolvedLocale, {
    q: resolvedSearchParams.q ?? "",
    city: resolvedSearchParams.city ?? "",
    region: resolvedSearchParams.region ?? "",
    category: resolvedSearchParams.category ?? "",
    tier: resolvedSearchParams.tier ?? "",
  });

  return (
    <DirectoryClient
      locale={resolvedLocale}
      initialListings={data.listings}
      initialCities={data.cities}
      initialRegions={data.regions}
      initialCategories={data.categories}
      initialCategoryCounts={data.categoryCounts}
      initialFilters={data.filters}
      globalSettings={data.globalSettings}
    />
  );
}
