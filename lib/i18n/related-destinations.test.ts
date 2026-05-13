import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { buildLocalizedPath } from "@/lib/i18n/localized-routing";
import { buildUniformLocalizedSlugMap } from "@/lib/i18n/localized-routing.entities";

const REPO_ROOT = process.cwd();

describe("related destination listing links", () => {
  it("keeps related destination copy translated across supported locales", () => {
    const expected = {
      en: {
        title: "Related destinations",
        description: "Explore nearby Algarve destinations with curated places and services.",
      },
      "pt-pt": {
        title: "Destinos relacionados",
        description: "Explore destinos próximos no Algarve com lugares e serviços curados.",
      },
      fr: {
        title: "Destinations associées",
        description: "Découvrez des destinations proches en Algarve avec des lieux et services sélectionnés.",
      },
      de: {
        title: "Ähnliche Reiseziele",
        description: "Entdecke nahegelegene Ziele an der Algarve mit kuratierten Orten und Services.",
      },
      es: {
        title: "Destinos relacionados",
        description: "Explora destinos cercanos del Algarve con lugares y servicios seleccionados.",
      },
      it: {
        title: "Destinazioni correlate",
        description: "Esplora destinazioni vicine in Algarve con luoghi e servizi selezionati.",
      },
      nl: {
        title: "Gerelateerde bestemmingen",
        description: "Ontdek nabijgelegen bestemmingen in de Algarve met zorgvuldig geselecteerde plekken en services.",
      },
      sv: {
        title: "Relaterade destinationer",
        description: "Utforska närliggande destinationer i Algarve med utvalda platser och tjänster.",
      },
      no: {
        title: "Relaterte reisemål",
        description: "Utforsk nærliggende reisemål i Algarve med utvalgte steder og tjenester.",
      },
      da: {
        title: "Relaterede destinationer",
        description: "Udforsk nærliggende destinationer i Algarve med udvalgte steder og tjenester.",
      },
    };

    for (const [locale, values] of Object.entries(expected)) {
      const messages = JSON.parse(
        readFileSync(join(REPO_ROOT, "i18n", "locales", `${locale}.json`), "utf8"),
      );

      expect(messages.listing.relatedDestinations).toBe(values.title);
      expect(messages.listing.relatedDestinationsDescription).toBe(values.description);
    }
  });

  it("builds related destination card links through the localized entity route", () => {
    const route = {
      routeType: "destination" as const,
      id: "region-id",
      slugs: buildUniformLocalizedSlugMap("vilamoura-prestige"),
    };

    expect(buildLocalizedPath("en", route)).toBe("/destinations/vilamoura-prestige");
    expect(buildLocalizedPath("fr", route)).toBe("/fr/destinations/vilamoura-prestige");
    expect(buildLocalizedPath("pt-pt", route)).toBe("/pt-pt/destinations/vilamoura-prestige");
  });

  it("uses the destination route helper in listing detail cards", () => {
    const source = readFileSync(
      join(REPO_ROOT, "components", "listing", "ListingDetailClient.tsx"),
      "utf8",
    );

    expect(source).toContain('routeType: "destination"');
    expect(source).toContain("buildUniformLocalizedSlugMap(r.slug)");
    expect(source).not.toContain("l(`/destinations/${r.slug}`)");
  });
});
