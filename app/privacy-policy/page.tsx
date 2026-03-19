"use client";

import { Suspense } from "react";
import PrivacyPolicy from "@/legacy-pages/legal/PrivacyPolicy";

export default function PrivacyPolicyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PrivacyPolicy />
    </Suspense>
  );
}
