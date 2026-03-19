"use client";

import { useMemo, type ReactElement } from "react";
import { useParams } from "next/navigation";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { OwnerLayout } from "@/components/owner/OwnerLayout";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import OwnerOverview from "@/legacy-pages/owner/OwnerOverview";
import OwnerListings from "@/legacy-pages/owner/OwnerListings";
import OwnerListingEdit from "@/legacy-pages/owner/OwnerListingEdit";
import OwnerMedia from "@/legacy-pages/owner/OwnerMedia";
import OwnerMembership from "@/legacy-pages/owner/OwnerMembership";
import OwnerMessages from "@/legacy-pages/owner/OwnerMessages";
import OwnerSupport from "@/legacy-pages/owner/OwnerSupport";
import OwnerEvents from "@/legacy-pages/owner/OwnerEvents";
import OwnerEventSubmit from "@/legacy-pages/owner/OwnerEventSubmit";

function OwnerRouteNotFound({ route }: { route: string }) {
  return (
    <div className="mx-auto flex min-h-[55vh] w-full max-w-2xl flex-col items-center justify-center rounded-2xl border border-border/70 bg-card/60 px-6 py-10 text-center">
      <AlertTriangle className="mb-4 h-10 w-10 text-amber-500" />
      <h1 className="text-2xl font-serif font-semibold text-foreground">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The owner route <code className="rounded bg-muted px-1.5 py-0.5">/owner/{route || ""}</code> is not configured.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button asChild>
          <Link href="/owner">Back to Overview</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/owner/listings">Go to Listings</Link>
        </Button>
      </div>
    </div>
  );
}

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

  return staticRouteMap[route] ?? <OwnerRouteNotFound route={route} />;
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
