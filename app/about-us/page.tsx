"use client";

import { Suspense } from "react";
import AboutUs from "@/legacy-pages/public/AboutUs";

export default function AboutUsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AboutUs />
    </Suspense>
  );
}
