"use client";

import { Suspense } from "react";
import ResetPassword from "@/legacy-pages/auth/ResetPassword";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ResetPassword />
    </Suspense>
  );
}
