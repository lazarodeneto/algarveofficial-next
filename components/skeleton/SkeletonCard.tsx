import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SkeletonCardVariant = "listing" | "category" | "destination";

interface SkeletonCardProps {
  variant?: SkeletonCardVariant;
  className?: string;
}

export default function SkeletonCard({ variant = "listing", className }: SkeletonCardProps) {
  if (variant === "category") {
    return (
      <div className={cn("glass-box p-6 lg:p-8 text-center flex flex-col items-center animate-pulse", className)}>
        <Skeleton className="w-14 h-14 rounded-lg mb-5" />
        <Skeleton className="h-6 w-2/3 mb-4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  }

  if (variant === "destination") {
    return (
      <div className={cn("glass-box overflow-hidden aspect-[4/5] relative animate-pulse", className)}>
        <Skeleton className="absolute inset-0 rounded-none" />
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <Skeleton className="h-4 w-24 mb-3 bg-black/20 dark:bg-white/20" />
          <Skeleton className="h-7 w-2/3 mb-3 bg-black/20 dark:bg-white/20" />
          <Skeleton className="h-4 w-full mb-2 bg-black/20 dark:bg-white/20" />
          <Skeleton className="h-4 w-3/4 bg-black/20 dark:bg-white/20" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("glass-box overflow-hidden flex flex-col h-full animate-pulse", className)}>
      <div className="relative aspect-square">
        <Skeleton className="absolute inset-0 rounded-none" />
        <div className="absolute top-3 left-3">
          <Skeleton className="h-7 w-24 rounded-md bg-white/70 dark:bg-black/30" />
        </div>
        <div className="absolute top-3 right-3">
          <Skeleton className="h-6 w-16 rounded-full bg-white/70 dark:bg-black/30" />
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <Skeleton className="h-6 w-28 rounded-full bg-white/70 dark:bg-black/30" />
          <Skeleton className="h-8 w-8 rounded-full bg-white/70 dark:bg-black/30" />
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="mt-auto flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}
