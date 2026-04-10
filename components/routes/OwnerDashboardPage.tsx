"use client";

import type { ComponentType, ReactElement } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { DashboardRouteLoading } from "@/components/routes/DashboardRouteLoading";
import { Button } from "@/components/ui/button";
import { OwnerLayout } from "@/components/owner/OwnerLayout";

const withOwnerLoading = <T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
) =>
  dynamic(loader, {
    loading: () => <DashboardRouteLoading label="Loading owner workspace..." />,
  });

const OwnerEventSubmit = withOwnerLoading(() => import("@/legacy-pages/owner/OwnerEventSubmit"));
const OwnerEvents = withOwnerLoading(() => import("@/legacy-pages/owner/OwnerEvents"));
const OwnerListingEdit = withOwnerLoading(() => import("@/legacy-pages/owner/OwnerListingEdit"));
const OwnerListings = withOwnerLoading(() => import("@/legacy-pages/owner/OwnerListings"));
const OwnerMedia = withOwnerLoading(() => import("@/legacy-pages/owner/OwnerMedia"));
const OwnerMembership = withOwnerLoading(() => import("@/legacy-pages/owner/OwnerMembership"));
const OwnerMessages = withOwnerLoading(() => import("@/legacy-pages/owner/OwnerMessages"));
const OwnerOverview = withOwnerLoading(() => import("@/legacy-pages/owner/OwnerOverview"));
const OwnerSupport = withOwnerLoading(() => import("@/legacy-pages/owner/OwnerSupport"));

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
          <LocaleLink href="/owner">Back to Overview</LocaleLink>
        </Button>
        <Button variant="outline" asChild>
          <LocaleLink href="/owner/listings">Go to Listings</LocaleLink>
        </Button>
      </div>
    </div>
  );
}

const staticRouteMap: Record<string, ComponentType> = {
  "": OwnerOverview,
  listings: OwnerListings,
  media: OwnerMedia,
  membership: OwnerMembership,
  messages: OwnerMessages,
  support: OwnerSupport,
  events: OwnerEvents,
  "events/new": OwnerEventSubmit,
};

function resolveOwnerPage(route: string): ReactElement {
  if (/^listings\/[^/]+\/edit$/.test(route)) {
    return <OwnerListingEdit />;
  }

  if (/^events\/[^/]+\/edit$/.test(route)) {
    return <OwnerEventSubmit />;
  }

  const PageComponent = staticRouteMap[route];
  return PageComponent ? <PageComponent /> : <OwnerRouteNotFound route={route} />;
}

interface OwnerDashboardPageProps {
  route?: string;
}

export function OwnerDashboardPage({ route = "" }: OwnerDashboardPageProps) {
  const activePage = resolveOwnerPage(route);

  return (
    <ProtectedRoute allowedRoles={["owner", "admin"]}>
      <OwnerLayout>{activePage}</OwnerLayout>
    </ProtectedRoute>
  );
}
