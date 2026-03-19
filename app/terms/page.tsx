"use client";

import { Suspense } from "react";
import TermsOfService from "@/legacy-pages/legal/TermsOfService";

export default function TermsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <TermsOfService />
    </Suspense>
  );
}
