"use client";

import { cn } from "@/lib/utils";

export interface UtilityCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "bordered" | "elevated";
}

const utilityVariants = {
  default: "bg-card/40 border-border/70",
  bordered: "bg-transparent border-border",
  elevated: "bg-card border-border/60 shadow-sm",
};

export function UtilityCard({
  title,
  children,
  className,
  variant = "default",
}: UtilityCardProps) {
  return (
    <article
      className={cn(
        "rounded-2xl border p-6 transition duration-200",
        utilityVariants[variant],
        className
      )}
    >
      <h3 className="text-2xl font-serif font-medium text-foreground">
        {title}
      </h3>
      <div className="mt-3 text-sm leading-7 text-muted-foreground">
        {children}
      </div>
    </article>
  );
}

export default UtilityCard;
