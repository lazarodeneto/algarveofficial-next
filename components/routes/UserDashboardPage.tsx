"use client";

import type { ComponentType, ReactElement } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { DashboardRouteLoading } from "@/components/routes/DashboardRouteLoading";
import { Button } from "@/components/ui/Button";
import { UserLayout } from "@/components/user/UserLayout";

const withDashboardLoading = <T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
) =>
  dynamic(loader, {
    loading: () => <DashboardRouteLoading label="Loading your dashboard..." />,
  });

const UserFavorites = withDashboardLoading(() => import("@/legacy-pages/user/UserFavorites"));
const UserMessages = withDashboardLoading(() => import("@/legacy-pages/user/UserMessages"));
const UserOverview = withDashboardLoading(() => import("@/legacy-pages/user/UserOverview"));
const UserProfile = withDashboardLoading(() => import("@/legacy-pages/user/UserProfile"));
const UserTripPlanner = withDashboardLoading(() => import("@/legacy-pages/user/UserTripPlanner"));

function DashboardRouteNotFound({ route }: { route: string }) {
  return (
    <div className="mx-auto flex min-h-[55vh] w-full max-w-2xl flex-col items-center justify-center rounded-sm border border-border/70 bg-card/60 px-6 py-10 text-center">
      <AlertTriangle className="mb-4 h-10 w-10 text-amber-500" />
      <h1 className="text-2xl font-serif font-semibold text-foreground">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The dashboard route <code className="rounded bg-muted px-1.5 py-0.5">/dashboard/{route ?? ""}</code> is not configured.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button asChild>
          <LocaleLink href="/dashboard">Back to Overview</LocaleLink>
        </Button>
        <Button variant="outline" asChild>
          <LocaleLink href="/dashboard/favorites">Go to Favorites</LocaleLink>
        </Button>
      </div>
    </div>
  );
}

const staticRouteMap: Record<string, ComponentType> = {
  "": UserOverview,
  trips: UserTripPlanner,
  favorites: UserFavorites,
  messages: UserMessages,
  profile: UserProfile,
};

function resolveDashboardPage(route: string): ReactElement {
  const PageComponent = staticRouteMap[route];
  return PageComponent ? <PageComponent /> : <DashboardRouteNotFound route={route} />;
}

interface UserDashboardPageProps {
  route?: string;
}

export function UserDashboardPage({ route = "" }: UserDashboardPageProps) {
  const activePage = resolveDashboardPage(route);

  return (
    <ProtectedRoute allowedRoles={["viewer_logged", "admin"]}>
      <UserLayout>{activePage}</UserLayout>
    </ProtectedRoute>
  );
}
