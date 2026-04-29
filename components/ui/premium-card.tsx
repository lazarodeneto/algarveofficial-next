import Image from "next/image";
import { cn } from "@/lib/utils";

interface PremiumCardProps {
  title: string;
  description?: string;
  imageUrl?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PremiumCard({
  title,
  description,
  imageUrl,
  children,
  className,
}: PremiumCardProps) {
  return (
    <div
      className={cn(
        "group overflow-hidden rounded-2xl bg-white shadow-soft transition-shadow duration-300 [backface-visibility:hidden] hover:shadow-xl",
        className
      )}
    >
      {imageUrl && (
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="rounded-2xl object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-110"
          />
        </div>
      )}
      <div className="p-5">
        <h3 className="text-lg font-medium text-brand-ink md:text-xl">
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
