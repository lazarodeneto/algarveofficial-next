"use client";

import { Suspense } from "react";
import CookiePolicy from "@/legacy-pages/legal/CookiePolicy";

export default function CookiePolicyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CookiePolicy />
    </Suspense>
  );
}
