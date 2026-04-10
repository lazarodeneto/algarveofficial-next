import { cn } from "@/lib/utils";

interface RouteLoadingStateProps {
  minHeightClassName?: string;
  className?: string;
  label?: string;
}

export function RouteLoadingState({
  minHeightClassName = "min-h-screen",
  className,
  label = "Loading",
}: RouteLoadingStateProps) {
  return (
    <main
      className={cn(
        "flex items-center justify-center bg-background",
        minHeightClassName,
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    </main>
  );
}
