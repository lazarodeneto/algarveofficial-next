import { Suspense } from "react";
import AuthCallback from "@/legacy-pages/auth/AuthCallback";
import { RouteLoadingState } from "@/components/layout/RouteLoadingState";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <AuthCallback />
    </Suspense>
  );
}
