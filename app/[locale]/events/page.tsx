import { Suspense } from "react";
import Events from "@/legacy-pages/public/events/Events";

export const revalidate = 3600;

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Events />
    </Suspense>
  );
}
