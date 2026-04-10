import { Suspense } from "react";
import ResetPassword from "@/legacy-pages/auth/ResetPassword";
import { RouteLoadingState } from "@/components/layout/RouteLoadingState";

export default function AuthResetPasswordPage() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <ResetPassword />
    </Suspense>
  );
}
