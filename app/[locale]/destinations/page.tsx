import { Suspense } from "react";
import { DestinationsClient } from "@/components/destinations/DestinationsClient";
import { RouteLoadingState } from "@/components/layout/RouteLoadingState";

export default function DestinationsPage() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <DestinationsClient initialRegions={[]} />
    </Suspense>
  );
}
