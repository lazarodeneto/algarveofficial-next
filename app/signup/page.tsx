"use client";

import { Suspense } from "react";
import Signup from "@/legacy-pages/auth/Signup";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Signup />
    </Suspense>
  );
}
