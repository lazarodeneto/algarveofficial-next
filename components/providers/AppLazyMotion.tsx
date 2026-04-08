"use client";

import type { ReactNode } from "react";
import { LazyMotion, domAnimation } from "framer-motion";

interface AppLazyMotionProps {
  children: ReactNode;
}

export function AppLazyMotion({ children }: AppLazyMotionProps) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
