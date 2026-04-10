"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface RouteMessageStateProps {
  title: string;
  description: string;
  eyebrow?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  minHeightClassName?: string;
  className?: string;
}

export function RouteMessageState({
  title,
  description,
  eyebrow,
  icon,
  actions,
  minHeightClassName = "min-h-[60vh]",
  className,
}: RouteMessageStateProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center px-4 py-16 text-center",
        minHeightClassName,
        className,
      )}
    >
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-border/70 bg-card/70 px-8 py-10 shadow-[0_24px_70px_-50px_rgba(15,23,42,0.45)] backdrop-blur-sm">
        {icon ? <div className="mb-5 flex justify-center text-primary">{icon}</div> : null}
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
        ) : null}
        <h1 className="mt-4 font-serif text-3xl text-foreground sm:text-4xl">{title}</h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">{description}</p>
        {actions ? <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}
