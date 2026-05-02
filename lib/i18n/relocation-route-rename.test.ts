import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { PRIMARY_NAV_ITEMS } from "@/lib/navigation/nav-items";
import { buildLocalizedPath } from "./routing";
import { generateMetadata } from "@/app/[locale]/relocation/page";

const REPO_ROOT = process.cwd();

describe("relocation route rename", () => {
  it("preserves locale when building relocation links", () => {
    expect(buildLocalizedPath("en", "/relocation")).toBe("/en/relocation");
    expect(buildLocalizedPath("pt-pt", "/relocation")).toBe("/pt-pt/relocation");
    expect(buildLocalizedPath("fr", "/relocation")).toBe("/fr/relocation");
  });

  it("redirect aliases canonicalize to relocation", () => {
    expect(buildLocalizedPath("en", "/residence")).toBe("/en/relocation");
    expect(buildLocalizedPath("pt-pt", "/residence")).toBe("/pt-pt/relocation");
    expect(buildLocalizedPath("de", "/live")).toBe("/de/relocation");
  });

  it("uses relocation in primary public navigation", () => {
    const item = PRIMARY_NAV_ITEMS.find((navItem) => navItem.labelKey === "nav.relocation");
    expect(item).toMatchObject({ fallbackLabel: "Relocation", href: "/relocation" });
  });

  it("has complete localized relocation labels and page copy", () => {
    const expected = {
      en: {
        nav: "Relocation",
        title: "Relocation to the Algarve",
        seoTitle: "Relocation to the Algarve | Move, Live & Settle in Portugal",
        description: "Practical guidance, trusted services, and curated local resources for moving to the Algarve with confidence.",
      },
      "pt-pt": {
        nav: "Mudança",
        title: "Mudança para o Algarve",
        seoTitle: "Mudança para o Algarve | Mudar, viver e instalar-se em Portugal",
        description: "Guias práticos, serviços de confiança e recursos locais selecionados para mudar para o Algarve com confiança.",
      },
      fr: {
        nav: "S’installer",
        title: "S’installer en Algarve",
        seoTitle: "S’installer en Algarve | Déménager, vivre et s’établir au Portugal",
        description: "Des guides pratiques, des services de confiance et des ressources locales sélectionnées pour s’installer en Algarve en toute confiance.",
      },
      de: {
        nav: "Umzug",
        title: "Umzug an die Algarve",
        seoTitle: "Umzug an die Algarve | Umziehen, leben und ankommen in Portugal",
        description: "Praktische Orientierung, vertrauenswürdige Dienstleistungen und kuratierte lokale Ressourcen für einen sicheren Umzug an die Algarve.",
      },
      es: {
        nav: "Traslado",
        title: "Traslado al Algarve",
        seoTitle: "Traslado al Algarve | Mudarse, vivir e instalarse en Portugal",
        description: "Guías prácticas, servicios de confianza y recursos locales seleccionados para trasladarse al Algarve con seguridad.",
      },
      it: {
        nav: "Trasferimento",
        title: "Trasferirsi in Algarve",
        seoTitle: "Trasferirsi in Algarve | Traslocare, vivere e stabilirsi in Portogallo",
        description: "Guide pratiche, servizi affidabili e risorse locali selezionate per trasferirsi in Algarve con sicurezza.",
      },
      nl: {
        nav: "Verhuizen",
        title: "Verhuizen naar de Algarve",
        seoTitle: "Verhuizen naar de Algarve | Verhuizen, wonen en settelen in Portugal",
        description: "Praktische gidsen, betrouwbare diensten en zorgvuldig geselecteerde lokale bronnen om met vertrouwen naar de Algarve te verhuizen.",
      },
      sv: {
        nav: "Flytta",
        title: "Flytta till Algarve",
        seoTitle: "Flytta till Algarve | Flytta, bo och etablera dig i Portugal",
        description: "Praktiska guider, pålitliga tjänster och utvalda lokala resurser för att flytta till Algarve med trygghet.",
      },
      no: {
        nav: "Flytte",
        title: "Flytte til Algarve",
        seoTitle: "Flytte til Algarve | Flytte, bo og etablere seg i Portugal",
        description: "Praktiske guider, pålitelige tjenester og utvalgte lokale ressurser for å flytte til Algarve med trygghet.",
      },
      da: {
        nav: "Flytning",
        title: "Flytning til Algarve",
        seoTitle: "Flytning til Algarve | Flyt, bo og etablér dig i Portugal",
        description: "Praktiske guider, pålidelige tjenester og udvalgte lokale ressourcer til at flytte til Algarve med tryghed.",
      },
    };

    for (const [locale, values] of Object.entries(expected)) {
      const messages = JSON.parse(
        readFileSync(join(REPO_ROOT, "i18n", "locales", `${locale}.json`), "utf8"),
      );

      expect(messages.nav.relocation).toBe(values.nav);
      expect(messages.nav.live).toBe(values.nav);
      expect(messages.pages.relocation.title).toBe(values.title);
      expect(messages.pages.relocation.subtitle).toBe(values.description);
      expect(messages.pages.relocation.seoTitle).toBe(values.seoTitle);
      expect(messages.pages.relocation.seoDescription).toBe(values.description);
      expect(messages.live.hero.title).toBe(values.title);
      expect(messages.live.hero.subtitle).toBe(values.description);
      expect(messages.live.seoTitle).toBe(values.seoTitle);
      expect(messages.live.seoDescription).toBe(values.description);
      expect(messages.breadcrumbs.relocation).toBe(values.nav);
    }
  });

  it("sitemap includes relocation and excludes residence", () => {
    const sitemapSource = readFileSync(join(REPO_ROOT, "app", "sitemap.ts"), "utf8");
    expect(sitemapSource).toContain('path: "/relocation"');
    expect(sitemapSource).not.toContain('path: "/residence"');
  });

  it("relocation metadata canonicalizes to relocation", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: "en" }) });
    expect(metadata.alternates?.canonical).toContain("/en/relocation");
    expect(JSON.stringify(metadata.alternates?.languages)).toContain("/pt-pt/relocation");
  });
});
