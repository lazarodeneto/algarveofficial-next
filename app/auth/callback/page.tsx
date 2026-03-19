"use client";

import { Suspense } from "react";
import AuthCallback from "@/legacy-pages/auth/AuthCallback";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AuthCallback />
    </Suspense>
  );
}
