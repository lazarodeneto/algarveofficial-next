import { Suspense } from "react";
import Events from "@/legacy-pages/public/events/Events";
import { RouteLoadingState } from "@/components/layout/RouteLoadingState";

export default function EventsPage() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <Events />
    </Suspense>
  );
}
