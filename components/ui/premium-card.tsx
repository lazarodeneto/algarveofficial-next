import Image from "next/image";
import { getSafeCmsImageSrc } from "@/lib/cms/image-source";
import { cn } from "@/lib/utils";

interface PremiumCardProps {
  title: string;
  description?: string;
  imageUrl?: string;
  emptyImageMode?: "hidden" | "black";
  children?: React.ReactNode;
  className?: string;
}

export function PremiumCard({
  title,
  description,
  imageUrl,
  emptyImageMode = "hidden",
  children,
  className,
}: PremiumCardProps) {
  const resolvedImageUrl = getSafeCmsImageSrc(imageUrl) ?? "";
  const hasImage = resolvedImageUrl.length > 0;

  return (
    <div
      className={cn(
        "group overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-300 ease-out [backface-visibility:hidden] hover:-translate-y-0.5 hover:shadow-card-hover",
        className
      )}
    >
      {hasImage ? (
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={resolvedImageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-110"
          />
        </div>
      ) : emptyImageMode === "black" ? (
        <div className="relative h-56 w-full overflow-hidden bg-black" aria-label={`${title} image not set`} />
      ) : null}
      <div className="p-5">
        <h3 className="font-card-title text-lg font-bold leading-tight tracking-[-0.01em] text-brand-ink md:text-xl">
          {title}
        </h3>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}
