import { Suspense } from "react";
import type { Metadata } from "next";

import LiveClient from "@/components/live/LiveClient";
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
    path: "/live",
    title: "Residence in the Algarve",
    description: "Practical guidance to relocate and build your life in the Algarve: residency pathways, neighborhoods, healthcare, education, and vetted local services.",
    keywords: ["residence in Algarve", "relocate to Portugal", "Algarve residency", "Algarve neighborhoods"],
  });
}

export default function LivePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LiveClient initialGlobalSettings={[]} />
    </Suspense>
  );
}
