import { getServerTranslations } from "@/lib/i18n/server";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { cn } from "@/lib/utils";

interface RouteLoadingStateProps {
  minHeightClassName?: string;
  className?: string;
  label?: string;
}

export async function RouteLoadingState({
  minHeightClassName = "min-h-screen",
  className,
  label,
}: RouteLoadingStateProps) {
  const locale = await getRequestLocale();
  const tx = label
    ? null
    : await getServerTranslations(locale, ["common.loading"]);
  const resolvedLabel = label ?? tx?.["common.loading"] ?? "";

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
        <span className="text-sm text-muted-foreground">{resolvedLabel}</span>
      </div>
    </main>
  );
}
