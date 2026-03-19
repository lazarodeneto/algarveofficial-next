"use client";

import { useMemo, type ReactElement } from "react";
import { useParams } from "next/navigation";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserLayout } from "@/components/user/UserLayout";
import UserOverview from "@/legacy-pages/user/UserOverview";
import UserTripPlanner from "@/legacy-pages/user/UserTripPlanner";
import UserFavorites from "@/legacy-pages/user/UserFavorites";
import UserMessages from "@/legacy-pages/user/UserMessages";
import UserProfile from "@/legacy-pages/user/UserProfile";

const staticRouteMap: Record<string, ReactElement> = {
  "": <UserOverview />,
  trips: <UserTripPlanner />,
  favorites: <UserFavorites />,
  messages: <UserMessages />,
  profile: <UserProfile />,
};

function resolveDashboardPage(route: string): ReactElement {
  return staticRouteMap[route] ?? <UserOverview />;
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
