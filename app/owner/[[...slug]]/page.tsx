"use client";

import { useMemo, type ReactElement } from "react";
import { useParams } from "next/navigation";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { OwnerLayout } from "@/components/owner/OwnerLayout";
import OwnerOverview from "@/legacy-pages/owner/OwnerOverview";
import OwnerListings from "@/legacy-pages/owner/OwnerListings";
import OwnerListingEdit from "@/legacy-pages/owner/OwnerListingEdit";
import OwnerMedia from "@/legacy-pages/owner/OwnerMedia";
import OwnerMembership from "@/legacy-pages/owner/OwnerMembership";
import OwnerMessages from "@/legacy-pages/owner/OwnerMessages";
import OwnerSupport from "@/legacy-pages/owner/OwnerSupport";
import OwnerEvents from "@/legacy-pages/owner/OwnerEvents";
import OwnerEventSubmit from "@/legacy-pages/owner/OwnerEventSubmit";

const staticRouteMap: Record<string, ReactElement> = {
  "": <OwnerOverview />,
  listings: <OwnerListings />,
  media: <OwnerMedia />,
  membership: <OwnerMembership />,
  messages: <OwnerMessages />,
  support: <OwnerSupport />,
  events: <OwnerEvents />,
  "events/new": <OwnerEventSubmit />,
};

function resolveOwnerPage(route: string): ReactElement {
  if (/^listings\/[^/]+\/edit$/.test(route)) {
    return <OwnerListingEdit />;
  }

  if (/^events\/[^/]+\/edit$/.test(route)) {
    return <OwnerEventSubmit />;
  }

  return staticRouteMap[route] ?? <OwnerOverview />;
}

export default function OwnerPage() {
  const params = useParams<{ slug?: string[] }>();

  const route = useMemo(() => {
    const raw = params?.slug;
    if (!raw) return "";
    return Array.isArray(raw) ? raw.join("/") : raw;
  }, [params]);

  const activePage = useMemo(() => resolveOwnerPage(route), [route]);

  return (
    <ProtectedRoute allowedRoles={["owner", "admin"]}>
      <OwnerLayout>
        {activePage}
      </OwnerLayout>
    </ProtectedRoute>
  );
}
