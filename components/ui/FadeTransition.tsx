"use client";

import { useState, useEffect, type ReactNode } from "react";

interface FadeTransitionProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  delay?: number;
}

export function FadeTransition({ isLoading, skeleton, children, delay = 120 }: FadeTransitionProps) {
  const [visible, setVisible] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    if (isLoading) {
      setVisible(false);
      setShowSkeleton(true);
      return;
    }

    setShowSkeleton(false);
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [isLoading, delay]);

  return (
    <div className="relative">
      <div
        className="transition-opacity duration-300 ease-out"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {visible ? children : null}
      </div>
      {showSkeleton && (
        <div className="absolute inset-0" aria-hidden="true">
          {skeleton}
        </div>
      )}
    </div>
  );
}