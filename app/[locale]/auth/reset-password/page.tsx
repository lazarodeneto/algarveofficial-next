"use client";

import { Suspense } from "react";
import ResetPassword from "@/legacy-pages/auth/ResetPassword";

export default function AuthResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ResetPassword />
    </Suspense>
  );
}
