"use client";

import { Suspense } from "react";
import { DestinationsClient } from "@/components/destinations/DestinationsClient";

export default function DestinationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <DestinationsClient initialRegions={[]} />
    </Suspense>
  );
}