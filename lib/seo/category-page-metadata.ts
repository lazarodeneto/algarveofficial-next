import type { Locale } from "@/lib/i18n/config";

export type CategorySearchParams = Record<string, string | string[] | undefined>;

function formatCount(locale: Locale, count: number): string {
  try {
    return new Intl.NumberFormat(locale).format(count);
  } catch {
    return String(count);
  }
}

function lowerCategoryName(categoryName: string, locale: Locale): string {
  try {
    return categoryName.toLocaleLowerCase(locale);
  } catch {
    return categoryName.toLowerCase();
  }
}

export function hasNonCanonicalCategorySearchParams(
  searchParams?: CategorySearchParams | null,
): boolean {
  if (!searchParams) return false;

  return Object.entries(searchParams).some(([key, value]) => {
    if (!key.trim()) return false;
    if (Array.isArray(value)) return true;
    return value !== undefined;
  });
}

export function buildCategoryPageMetaCopy({
  categoryName,
  locale,
  listingCount,
}: {
  categoryName: string;
  locale: Locale;
  listingCount: number;
}): {
  title: string;
  description: string;
  keywords: string[];
} {
  const safeCount = Math.max(0, Math.floor(Number.isFinite(listingCount) ? listingCount : 0));
  const count = formatCount(locale, safeCount);
  const categoryLower = lowerCategoryName(categoryName, locale);
  const hasListings = safeCount > 0;

  const titles: Record<Locale, string> = hasListings
    ? {
        en: `${count} ${categoryName} in the Algarve`,
        "pt-pt": `${count} ${categoryName} no Algarve`,
        fr: `${count} ${categoryName} en Algarve`,
        de: `${count} ${categoryName} an der Algarve`,
        es: `${count} ${categoryName} en el Algarve`,
        it: `${count} ${categoryName} in Algarve`,
        nl: `${count} ${categoryName} in de Algarve`,
        sv: `${count} ${categoryName} i Algarve`,
        no: `${count} ${categoryName} i Algarve`,
        da: `${count} ${categoryName} i Algarve`,
      }
    : {
        en: `${categoryName} in the Algarve`,
        "pt-pt": `${categoryName} no Algarve`,
        fr: `${categoryName} en Algarve`,
        de: `${categoryName} an der Algarve`,
        es: `${categoryName} en el Algarve`,
        it: `${categoryName} in Algarve`,
        nl: `${categoryName} in de Algarve`,
        sv: `${categoryName} i Algarve`,
        no: `${categoryName} i Algarve`,
        da: `${categoryName} i Algarve`,
      };

  const descriptions: Record<Locale, string> = hasListings
    ? {
        en: `Browse ${count} published ${categoryLower} in the Algarve with curated local recommendations from AlgarveOfficial.`,
        "pt-pt": `Explore ${count} ${categoryLower} publicados no Algarve com recomendacoes locais seleccionadas pelo AlgarveOfficial.`,
        fr: `Explorez ${count} ${categoryLower} publies en Algarve avec les recommandations locales d'AlgarveOfficial.`,
        de: `Entdecken Sie ${count} veroeffentlichte ${categoryLower} an der Algarve mit lokalen Empfehlungen von AlgarveOfficial.`,
        es: `Explora ${count} ${categoryLower} publicados en el Algarve con recomendaciones locales de AlgarveOfficial.`,
        it: `Scopri ${count} ${categoryLower} pubblicati in Algarve con consigli locali di AlgarveOfficial.`,
        nl: `Bekijk ${count} gepubliceerde ${categoryLower} in de Algarve met lokale tips van AlgarveOfficial.`,
        sv: `Utforska ${count} publicerade ${categoryLower} i Algarve med lokala rekommendationer fran AlgarveOfficial.`,
        no: `Utforsk ${count} publiserte ${categoryLower} i Algarve med lokale anbefalinger fra AlgarveOfficial.`,
        da: `Udforsk ${count} offentliggjorte ${categoryLower} i Algarve med lokale anbefalinger fra AlgarveOfficial.`,
      }
    : {
        en: `Explore ${categoryLower} in the Algarve. Published AlgarveOfficial listings will appear here when available.`,
        "pt-pt": `Explore ${categoryLower} no Algarve. As listagens publicadas no AlgarveOfficial aparecerao aqui quando disponiveis.`,
        fr: `Explorez ${categoryLower} en Algarve. Les fiches publiees sur AlgarveOfficial apparaitront ici lorsqu'elles seront disponibles.`,
        de: `Entdecken Sie ${categoryLower} an der Algarve. Veroeffentlichte AlgarveOfficial Eintraege erscheinen hier, sobald sie verfuegbar sind.`,
        es: `Explora ${categoryLower} en el Algarve. Los anuncios publicados en AlgarveOfficial apareceran aqui cuando esten disponibles.`,
        it: `Scopri ${categoryLower} in Algarve. Gli annunci pubblicati su AlgarveOfficial appariranno qui quando disponibili.`,
        nl: `Ontdek ${categoryLower} in de Algarve. Gepubliceerde AlgarveOfficial-vermeldingen verschijnen hier zodra ze beschikbaar zijn.`,
        sv: `Utforska ${categoryLower} i Algarve. Publicerade AlgarveOfficial-listningar visas har nar de finns tillgangliga.`,
        no: `Utforsk ${categoryLower} i Algarve. Publiserte AlgarveOfficial-oppforinger vises her nar de er tilgjengelige.`,
        da: `Udforsk ${categoryLower} i Algarve. Offentliggjorte AlgarveOfficial-lister vises her, nar de er tilgaengelige.`,
      };

  return {
    title: titles[locale] ?? titles.en,
    description: descriptions[locale] ?? descriptions.en,
    keywords: [
      categoryName,
      categoryLower,
      "Algarve",
      "AlgarveOfficial",
      "Portugal",
      "directory",
    ],
  };
}
