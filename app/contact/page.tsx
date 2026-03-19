"use client";

import { Suspense } from "react";
import Contact from "@/legacy-pages/public/Contact";

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Contact />
    </Suspense>
  );
}
