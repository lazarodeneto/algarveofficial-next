"use client";
import { cn } from "@/lib/utils";
import { Crown } from "lucide-react";

interface FleurDeLisProps {
  className?: string;
}

export function FleurDeLis({ className }: FleurDeLisProps) {
  return <Crown className={cn("h-6 w-6", className)} />;
}
