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
      <div className={cn("rounded-sm p-6 lg:p-8 text-center flex flex-col items-center animate-pulse bg-card border border-border/40 shadow-sm", className)}>
        <Skeleton className="w-14 h-14 rounded-xl mb-5 bg-gradient-to-br from-[#C7A35A]/10 to-transparent" />
        <Skeleton className="h-6 w-2/3 mb-4 bg-gradient-to-r from-foreground/10 to-transparent" />
        <Skeleton className="h-4 w-1/3 bg-gradient-to-r from-muted-foreground/10 to-transparent" />
      </div>
    );
  }

  if (variant === "destination") {
    return (
      <div className={cn("rounded-sm overflow-hidden aspect-[4/5] relative animate-pulse bg-card border border-border/40 shadow-sm", className)}>
        <Skeleton className="absolute inset-0 rounded-none bg-gradient-to-br from-muted to-background" />
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
    <div className={cn("rounded-sm overflow-hidden flex flex-col h-full animate-pulse bg-card border border-border/40 shadow-sm", className)}>
      <div className="relative aspect-[4/3] bg-gradient-to-br from-muted to-background">
        <div className="absolute top-4 left-4">
          <Skeleton className="h-7 w-24 rounded-full bg-gradient-to-r from-[#C7A35A]/20 to-transparent" />
        </div>
        <div className="absolute top-4 right-4">
          <Skeleton className="h-6 w-16 rounded-full bg-white/50" />
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <Skeleton className="h-6 w-28 rounded-full bg-white/50" />
          <Skeleton className="h-8 w-8 rounded-full bg-white/50" />
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col gap-3 bg-card">
        <Skeleton className="h-6 w-3/4 bg-gradient-to-r from-foreground/10 to-transparent" />
        <Skeleton className="h-4 w-full bg-gradient-to-r from-muted-foreground/10 to-transparent" />
        <Skeleton className="h-4 w-2/3 bg-gradient-to-r from-muted-foreground/10 to-transparent" />
        <div className="mt-auto flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full bg-[#C7A35A]/20" />
          <Skeleton className="h-3 w-24 bg-gradient-to-r from-muted-foreground/10 to-transparent" />
        </div>
      </div>
    </div>
  );
}
