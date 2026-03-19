import type { Metadata } from "next";
import { Suspense } from "react";
import Index from "@/components/Index";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "AlgarveOfficial | Luxury Villas, Golf & Restaurants",
  description:
    "Discover the Algarve's finest villas, restaurants and golf courses — curated by experts who know every corner of Portugal's most prestigious coast.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <Index />
      </Suspense>
    </>
  );
}
