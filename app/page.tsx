import type { Metadata } from "next";
import { Suspense } from "react";
import Index from "@/components/Index";
import { buildMetadata } from "@/lib/metadata";
import { buildOrganizationSchema, buildWebsiteSchema } from "@/lib/seo/schemaBuilders.js";

export const metadata: Metadata = buildMetadata({
  title: "AlgarveOfficial | Luxury Villas, Golf & Restaurants",
  description:
    "Discover the Algarve's finest villas, restaurants and golf courses — curated by experts who know every corner of Portugal's most prestigious coast.",
  path: "/",
});

export default function HomePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://algarveofficial.com";
  const organizationSchema = buildOrganizationSchema(siteUrl);
  const websiteSchema = buildWebsiteSchema(siteUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <Index />
      </Suspense>
    </>
  );
}
