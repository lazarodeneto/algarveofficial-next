import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PricingClient } from "@/components/pricing/PricingClient";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Partner Pricing | AlgarveOfficial",
    description:
      "Transparent pricing for every stage of growth. From Verified visibility to Signature placement. See ROI estimates for Algarve partners.",
    localizedPath: "/pricing",
  });
}

export default function LocalePricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <PricingClient />
      <Footer />
    </div>
  );
}
