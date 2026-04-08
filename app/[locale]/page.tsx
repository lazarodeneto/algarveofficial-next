import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Index from "@/components/Index";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    return {};
  }

  const locale = rawLocale as Locale;
  return buildLocalizedMetadata({
    locale,
    path: "/",
    title: "AlgarveOfficial | Luxury Villas, Golf & Restaurants",
    description:
      "Discover the Algarve's finest villas, restaurants and golf courses — curated by experts who know every corner of Portugal's most prestigious coast.",
  });
}

export default async function HomePage({ params }: PageProps) {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    notFound();
  }

  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <Index />
      </Suspense>
    </>
  );
}
