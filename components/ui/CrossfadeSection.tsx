"use client";

import { useState, useEffect, type ReactNode } from "react";

interface CrossfadeSectionProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  delay?: number;
}

export function CrossfadeSection({ isLoading, skeleton, children, delay = 120 }: CrossfadeSectionProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShowContent(false);
      return;
    }

    const timer = setTimeout(() => setShowContent(true), delay);
    return () => clearTimeout(timer);
  }, [isLoading, delay]);

  return (
    <div className="relative">
      <div
        className="transition-opacity duration-300 ease-out"
        style={{ opacity: showContent ? 1 : 0, minHeight: showContent ? "auto" : "1px" }}
      >
        {showContent ? children : null}
      </div>
      {!showContent && <div className="absolute inset-0">{skeleton}</div>}
    </div>
  );
}