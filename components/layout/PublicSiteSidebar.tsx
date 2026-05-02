"use client";

import { useRef, useState, type FocusEvent } from "react";
import clsx from "clsx";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { BrandLogo } from "@/components/ui/brand-logo";
import { SidebarNav } from "@/components/layout/SidebarNav";

export function PublicSiteSidebar() {
  const [expanded, setExpanded] = useState(false);
  const asideRef = useRef<HTMLElement | null>(null);

  const handleBlurCapture = (event: FocusEvent<HTMLElement>) => {
    const nextFocused = event.relatedTarget;

    if (!nextFocused || !asideRef.current?.contains(nextFocused as Node)) {
      setExpanded(false);
    }
  };

  return (
    <aside
      ref={asideRef}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocusCapture={() => setExpanded(true)}
      onBlurCapture={handleBlurCapture}
      className={clsx(
        "hidden lg:flex fixed inset-y-0 left-0 z-[120] flex-col overflow-hidden border-r border-border bg-background/95 backdrop-blur-xl",
        "shadow-[0_20px_48px_-36px_rgba(15,23,42,0.45)] transition-[width,box-shadow] duration-300 ease-out",
        expanded ? "w-[17rem]" : "w-20",
      )}
    >
      <div
        className={clsx(
          "flex h-20 items-center border-b border-border transition-[padding,justify-content] duration-300",
          expanded ? "justify-start px-4" : "justify-center",
        )}
      >
        <LocaleLink
          href="/"
          aria-label="AlgarveOfficial homepage"
          className={clsx(
            "flex h-12 items-center overflow-hidden rounded-sm border border-border/70 bg-white/80 shadow-[0_12px_24px_-18px_rgba(15,23,42,0.45)] dark:bg-white/10",
            "transition-[width,padding,gap,transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_16px_30px_-22px_rgba(15,23,42,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            expanded ? "w-full gap-3 px-4" : "w-12 justify-center",
          )}
        >
          <BrandLogo size="sm" showIcon showText={false} asLink={false} className="justify-center" iconClassName="h-6 w-6 shrink-0" />
          {expanded ? (
            <span className="whitespace-nowrap font-serif text-lg font-normal tracking-tight">
              <span className="brand-logo-algarve text-gradient-gold">Algarve</span>
              <span className="brand-logo-official text-foreground">Official</span>
            </span>
          ) : null}
        </LocaleLink>
      </div>
      <div className={clsx("flex-1 overflow-y-auto py-5", expanded ? "px-3" : "px-3")}>
        <SidebarNav expanded={expanded} />
      </div>
    </aside>
  );
}
