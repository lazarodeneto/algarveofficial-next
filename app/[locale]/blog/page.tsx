import type { Metadata } from "next";
import { Suspense } from "react";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import Blog from "@/legacy-pages/public/blog/Blog";
import { RouteLoadingState } from "@/components/layout/RouteLoadingState";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const BLOG_META: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "Algarve Blog | Travel Tips, Guides & Local Inspiration",
    description:
      "Explore travel guides, local tips, food & wine stories and lifestyle inspiration from the Algarve — curated by people who live and breathe this coast.",
  },
  "pt-pt": {
    title: "Blog do Algarve | Dicas de Viagem, Guias e Inspiração Local",
    description:
      "Explore guias de viagem, dicas locais, histórias de gastronomia e inspiração de estilo de vida do Algarve.",
  },
  fr: {
    title: "Blog Algarve | Conseils de Voyage, Guides et Inspiration Locale",
    description:
      "Explorez des guides de voyage, des conseils locaux, des histoires culinaires et une inspiration de style de vie de l'Algarve.",
  },
  de: {
    title: "Algarve Blog | Reisetipps, Reiseführer und lokale Inspiration",
    description:
      "Entdecken Sie Reiseführer, lokale Tipps, Kulinarisches und Lifestyle-Inspiration aus der Algarve.",
  },
  es: {
    title: "Blog del Algarve | Consejos de Viaje, Guías e Inspiración Local",
    description:
      "Explora guías de viaje, consejos locales, historias de gastronomía e inspiración de estilo de vida del Algarve.",
  },
  it: {
    title: "Blog dell'Algarve | Consigli di Viaggio, Guide e Ispirazione Locale",
    description:
      "Esplora guide di viaggio, consigli locali, storie di gastronomia e ispirazione di lifestyle dall'Algarve.",
  },
  nl: {
    title: "Algarve Blog | Reistips, Gidsen en Lokale Inspiratie",
    description:
      "Ontdek reisgidsen, lokale tips, eten & wijn verhalen en lifestyle inspiratie uit de Algarve.",
  },
  sv: {
    title: "Algarve-bloggen | Resetips, Guider och Lokal Inspiration",
    description:
      "Utforska reseguider, lokala tips, mat- och vinhistorier och livsstilsinspiration från Algarve.",
  },
  no: {
    title: "Algarve-bloggen | Reisetips, Guider og Lokal Inspirasjon",
    description:
      "Utforsk reiseguider, lokale tips, mat- og vinhistorier og livsstilsinspirasjoner fra Algarve.",
  },
  da: {
    title: "Algarve-bloggen | Rejsetips, Guider og Lokal Inspiration",
    description:
      "Udforsk rejseguider, lokale tips, mad- og vinhistorier og livsstilsinspiration fra Algarve.",
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isValidLocale(rawLocale)) return {};
  const locale = rawLocale as Locale;
  const meta = BLOG_META[locale];
  return buildLocalizedMetadata({
    locale,
    path: "/blog",
    title: meta.title,
    description: meta.description,
    keywords: ["Algarve blog", "Algarve travel guide", "Algarve tips", "Portugal travel blog"],
  });
}

export default function BlogPage() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <Blog />
    </Suspense>
  );
}
