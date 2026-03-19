"use client";

import { useMemo, type ReactElement } from "react";
import { useParams } from "next/navigation";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserLayout } from "@/components/user/UserLayout";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import UserOverview from "@/legacy-pages/user/UserOverview";
import UserTripPlanner from "@/legacy-pages/user/UserTripPlanner";
import UserFavorites from "@/legacy-pages/user/UserFavorites";
import UserMessages from "@/legacy-pages/user/UserMessages";
import UserProfile from "@/legacy-pages/user/UserProfile";

function DashboardRouteNotFound({ route }: { route: string }) {
  return (
    <div className="mx-auto flex min-h-[55vh] w-full max-w-2xl flex-col items-center justify-center rounded-2xl border border-border/70 bg-card/60 px-6 py-10 text-center">
      <AlertTriangle className="mb-4 h-10 w-10 text-amber-500" />
      <h1 className="text-2xl font-serif font-semibold text-foreground">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The dashboard route <code className="rounded bg-muted px-1.5 py-0.5">/dashboard/{route || ""}</code> is not configured.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button asChild>
          <Link href="/dashboard">Back to Overview</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/favorites">Go to Favorites</Link>
        </Button>
      </div>
    </div>
  );
}

const staticRouteMap: Record<string, ReactElement> = {
  "": <UserOverview />,
  trips: <UserTripPlanner />,
  favorites: <UserFavorites />,
  messages: <UserMessages />,
  profile: <UserProfile />,
};

function resolveDashboardPage(route: string): ReactElement {
  return staticRouteMap[route] ?? <DashboardRouteNotFound route={route} />;
}

export default function DashboardPage() {
  const params = useParams<{ slug?: string[] }>();

  const route = useMemo(() => {
    const raw = params?.slug;
    if (!raw) return "";
    return Array.isArray(raw) ? raw.join("/") : raw;
  }, [params]);

  const activePage = useMemo(() => resolveDashboardPage(route), [route]);

  return (
    <ProtectedRoute allowedRoles={["viewer_logged", "admin"]}>
      <UserLayout>
        {activePage}
      </UserLayout>
    </ProtectedRoute>
  );
}
