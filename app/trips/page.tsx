"use client";

import { Suspense } from "react";

import Trips from "@/legacy-pages/public/Trips";

export default function TripsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Trips />
    </Suspense>
  );
}
