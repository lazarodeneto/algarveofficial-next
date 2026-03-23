"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Locale } from "@/lib/i18n/config";
import { getCategoryUrlSlug } from "@/lib/seo/programmatic/category-slugs";
import type { CanonicalCategorySlug } from "@/lib/seo/programmatic/category-slugs";

const ALL_CATEGORIES: CanonicalCategorySlug[] = [
  "restaurants",
  "places-to-stay",
  "golf",
  "things-to-do",
  "beaches-clubs",
  "wellness-spas",
  "whats-on",
  "algarve-services",
  "shopping-boutiques",
];

interface InternalLinksProps {
  locale: Locale;
  currentCity?: string;
  currentCategory?: string;
  className?: string;
}

export function InternalLinks({
  locale,
  currentCity,
  currentCategory,
  className,
}: InternalLinksProps) {
  const isDefaultLocale = locale === "en";

  return (
    <nav aria-label="Internal navigation" className={cn("space-y-6", className)}>
      <CategoryLinks 
        locale={locale} 
        currentCategory={currentCategory}
        isDefaultLocale={isDefaultLocale}
      />
      
      {currentCity && (
        <CityCategoryLinks 
          locale={locale}
          currentCity={currentCity}
          currentCategory={currentCategory}
          isDefaultLocale={isDefaultLocale}
        />
      )}
    </nav>
  );
}

interface CategoryLinksProps {
  locale: Locale;
  currentCategory?: string;
  isDefaultLocale: boolean;
}

function CategoryLinks({ locale, currentCategory, isDefaultLocale }: CategoryLinksProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">
        {locale === "en" ? "Explore Categories" : "Explorar Categorias"}
      </h2>
      <div className="flex flex-wrap gap-2">
        {ALL_CATEGORIES.map((cat) => {
          if (cat === currentCategory) return null;
          
          const urlSlug = getCategoryUrlSlug(cat, locale);
          const path = isDefaultLocale 
            ? `/directory/${urlSlug}` 
            : `/${locale}/directory/${urlSlug}`;

          return (
            <Link
              key={cat}
              href={path}
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              {getCategoryDisplayName(cat, locale)}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

interface CityCategoryLinksProps {
  locale: Locale;
  currentCity: string;
  currentCategory?: string;
  isDefaultLocale: boolean;
}

function CityCategoryLinks({ locale, currentCity, currentCategory, isDefaultLocale }: CityCategoryLinksProps) {
  const popularCities = ["vilamoura", "quinta-do-lago", "lagos", "albufeira", "portimao", "tavira"];

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">
        {locale === "en" ? `More in ${currentCity.replace(/-/g, " ")}` : `Mais em ${currentCity.replace(/-/g, " ")}`}
      </h2>
      <div className="flex flex-wrap gap-2">
        {ALL_CATEGORIES.map((cat) => {
          if (cat === currentCategory) return null;
          
          const urlSlug = getCategoryUrlSlug(cat, locale);
          // NEW URL STRUCTURE: /{city}/{category}
          const path = isDefaultLocale 
            ? `/${currentCity}/${urlSlug}` 
            : `/${locale}/${currentCity}/${urlSlug}`;

          return (
            <Link
              key={`${currentCity}-${cat}`}
              href={path}
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
            >
              {getCategoryDisplayName(cat, locale)}
            </Link>
          );
        })}

        {popularCities.filter(c => c !== currentCity).slice(0, 3).map((city) => {
          // Link to same category in other cities
          const path = isDefaultLocale 
            ? `/${city}/${currentCategory ? getCategoryUrlSlug(currentCategory as CanonicalCategorySlug, locale) : "restaurants"}` 
            : `/${locale}/${city}/${currentCategory ? getCategoryUrlSlug(currentCategory as CanonicalCategorySlug, locale) : "restaurants"}`;

          return (
            <Link
              key={`${currentCity}-city-${city}`}
              href={path}
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
            >
              {city.replace(/-/g, " ")}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function getCategoryDisplayName(slug: CanonicalCategorySlug, locale: Locale): string {
  const names: Record<CanonicalCategorySlug, Record<string, string>> = {
    "restaurants": { en: "Restaurants", "pt-pt": "Restaurantes", fr: "Restaurants", de: "Restaurants", es: "Restaurantes", it: "Ristoranti", nl: "Restaurants", sv: "Restauranger", no: "Restauranter", da: "Restauranter" },
    "places-to-stay": { en: "Places to Stay", "pt-pt": "Alojamento", fr: "Hébergement", de: "Unterkunft", es: "Alojamiento", it: "Alloggio", nl: "Accommodatie", sv: "Boende", no: "Overnatting", da: "Overnatning" },
    "golf": { en: "Golf", "pt-pt": "Golfe", fr: "Golf", de: "Golf", es: "Golf", it: "Golf", nl: "Golf", sv: "Golf", no: "Golf", da: "Golf" },
    "things-to-do": { en: "Things to Do", "pt-pt": "Atividades", fr: "Activités", de: "Aktivitäten", es: "Actividades", it: "Cose da fare", nl: "Activiteiten", sv: "Saker att göra", no: "Ting å gjøre", da: "Ting at lave" },
    "beaches-clubs": { en: "Beaches", "pt-pt": "Praias", fr: "Plages", de: "Strände", es: "Playas", it: "Spiagge", nl: "Stranden", sv: "Stränder", no: "Strender", da: "Strande" },
    "wellness-spas": { en: "Wellness & Spas", "pt-pt": "Bem-estar", fr: "Bien-être", de: "Wellness", es: "Bienestar", it: "Benessere", nl: "Wellness", sv: "Wellness", no: "Velvære", da: "Velvære" },
    "whats-on": { en: "Events", "pt-pt": "Eventos", fr: "Événements", de: "Veranstaltungen", es: "Eventos", it: "Eventi", nl: "Evenementen", sv: "Evenemang", no: "Arrangementer", da: "Begivenheder" },
    "algarve-services": { en: "Services", "pt-pt": "Serviços", fr: "Services", de: "Dienstleistungen", es: "Servicios", it: "Servizi", nl: "Diensten", sv: "Tjänster", no: "Tjenester", da: "Tjenester" },
    "shopping-boutiques": { en: "Shopping", "pt-pt": "Compras", fr: "Shopping", de: "Einkaufen", es: "Compras", it: "Shopping", nl: "Winkelen", sv: "Shoppa", no: "Shopping", da: "Shopping" },
  };
  
  return names[slug]?.[locale] ?? slug;
}

export function SiteMapLinks({ locale, className }: { locale: Locale; className?: string }) {
  const isDefaultLocale = locale === "en";
  
  const mainLinks = [
    { href: isDefaultLocale ? "/" : `/${locale}`, label: locale === "en" ? "Home" : "Início" },
    { href: isDefaultLocale ? "/directory" : `/${locale}/directory`, label: locale === "en" ? "Directory" : "Diretório" },
    { href: isDefaultLocale ? "/destinations" : `/${locale}/destinations`, label: locale === "en" ? "Destinations" : "Destinos" },
    { href: isDefaultLocale ? "/events" : `/${locale}/events`, label: locale === "en" ? "Events" : "Eventos" },
    { href: isDefaultLocale ? "/blog" : `/${locale}/blog`, label: locale === "en" ? "Blog" : "Blog" },
  ];

  const categoryLinks = ALL_CATEGORIES.map((cat) => {
    const urlSlug = getCategoryUrlSlug(cat, locale);
    return {
      href: isDefaultLocale ? `/directory/${urlSlug}` : `/${locale}/directory/${urlSlug}`,
      label: getCategoryDisplayName(cat, locale),
    };
  });

  return (
    <nav className={cn("space-y-4", className)} aria-label="Site map">
      <div>
        <h3 className="font-semibold mb-2">AlgarveOfficial</h3>
        <ul className="space-y-1">
          {mainLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">
          {locale === "en" ? "Categories" : "Categorias"}
        </h3>
        <ul className="space-y-1">
          {categoryLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}