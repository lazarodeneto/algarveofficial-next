"use client";

import { Suspense } from "react";

import EventDetail from "@/legacy-pages/public/events/EventDetail";

export function EventDetailPageClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <EventDetail />
    </Suspense>
  );
}
