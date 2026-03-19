import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "@/components/router/nextRouterCompat";
import { ChevronDown, ChevronLeft, ChevronRight, Menu, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type SidebarBadgeTone = "primary" | "destructive";

export interface SidebarNavItem {
  id?: string;
  label: string;
  href?: string;
  openInNewTab?: boolean;
  icon: LucideIcon;
  badge?: number;
  badgeTone?: SidebarBadgeTone;
  end?: boolean;
  children?: SidebarNavItem[];
}

export interface SidebarNavSection {
  id: string;
  title?: string;
  dividerTop?: boolean;
  items: SidebarNavItem[];
}

export interface SidebarFooterItem {
  id: string;
  label: string;
  href?: string;
  openInNewTab?: boolean;
  icon?: LucideIcon;
  badge?: number;
  badgeTone?: SidebarBadgeTone;
}

export interface SidebarFooterSection {
  id: string;
  title?: string;
  items: SidebarFooterItem[];
}

interface ExpandableSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  logo: ReactNode;
  showHeader?: boolean;
  density?: "comfortable" | "compact";
  sections: SidebarNavSection[];
  footerText?: string;
  footerSections?: SidebarFooterSection[];
  desktopExpandedWidthClass?: string;
  desktopCollapsedWidthClass?: string;
  mobileToggleClassName?: string;
  className?: string;
}

function badgeClasses(tone: SidebarBadgeTone = "primary") {
  return tone === "destructive"
    ? "bg-destructive text-destructive-foreground"
    : "bg-primary text-primary-foreground";
}

export function ExpandableSidebar({
  collapsed,
  onToggle,
  logo,
  showHeader = true,
  density = "comfortable",
  sections,
  footerText,
  footerSections,
  desktopExpandedWidthClass = "w-64",
  desktopCollapsedWidthClass = "w-16",
  mobileToggleClassName,
  className,
}: ExpandableSidebarProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const compactDensity = density === "compact";
  const navItemPaddingY = compactDensity ? "py-1.5" : "py-2.5";
  const footerItemPaddingY = compactDensity ? "py-1" : "py-1.5";
  const sectionGapClass = compactDensity ? "space-y-px" : "space-y-1";
  const navContainerGapClass = compactDensity ? "gap-px" : "gap-1";
  const scrollPaddingYClass = compactDensity ? "py-2.5" : "py-4";

  const getItemKey = (item: SidebarNavItem, prefix: string) => item.id ?? `${prefix}-${item.href ?? "nohref"}-${item.label}`;

  const isLeafActive = useCallback((item: SidebarNavItem) => {
    if (!item.href) return false;
    if (item.end) return location.pathname === item.href;
    return location.pathname.startsWith(item.href);
  }, [location.pathname]);

  const isItemActive = useCallback((item: SidebarNavItem): boolean => {
    const walk = (node: SidebarNavItem): boolean => {
      if (node.children?.length) {
        return node.children.some(walk);
      }
      return isLeafActive(node);
    };
    return walk(item);
  }, [isLeafActive]);

  const initialOpenMap = useMemo(() => {
    const next: Record<string, boolean> = {};
    sections.forEach((section) => {
      section.items.forEach((item) => {
        if (!item.children?.length) return;
        const key = getItemKey(item, section.id);
        next[key] = isItemActive(item);
      });
    });
    return next;
  }, [sections, isItemActive]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(initialOpenMap);

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      Object.entries(initialOpenMap).forEach(([key, shouldBeOpen]) => {
        if (shouldBeOpen) next[key] = true;
        if (!(key in next)) next[key] = shouldBeOpen;
      });
      return next;
    });
  }, [initialOpenMap]);

  const closeMobile = () => setMobileOpen(false);

  const renderLeafItem = (
    item: SidebarNavItem,
    depth = 0,
    forceExpanded = false,
    keyHint?: string
  ) => {
    const isExternalHref = Boolean(item.href && /^(https?:\/\/|mailto:|tel:)/i.test(item.href));
    const shouldOpenInNewTab = Boolean(item.openInNewTab || isExternalHref);
    const active = shouldOpenInNewTab ? false : isLeafActive(item);
    const compact = collapsed && !forceExpanded;
    const leftPadClass = depth > 0 ? "pl-6" : "";

    if (!item.href) {
      return null;
    }

    const sharedClassName = cn(
      "relative flex items-center gap-3 px-3 rounded-lg text-sm font-medium transition-colors",
      "hover:bg-muted hover:text-foreground",
      active ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground",
      navItemPaddingY,
      compact && "justify-center px-2",
      leftPadClass,
    );

    const navItem = shouldOpenInNewTab ? (
      <a
        key={keyHint ?? getItemKey(item, `leaf-${depth}`)}
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={closeMobile}
        aria-label={compact ? item.label : undefined}
        className={sharedClassName}
      >
        <item.icon className={cn("h-5 w-5 flex-shrink-0", active && "text-primary", depth > 0 && "h-4 w-4")} />
        {!compact && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge ? (
              <span className={cn("flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] font-semibold px-1.5", badgeClasses(item.badgeTone))}>
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            ) : null}
          </>
        )}
        {compact && item.badge ? (
          <span className={cn("absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full text-[9px] font-semibold", badgeClasses(item.badgeTone))}>
            {item.badge > 9 ? "9+" : item.badge}
          </span>
        ) : null}
      </a>
    ) : (
      <NavLink
        key={keyHint ?? getItemKey(item, `leaf-${depth}`)}
        href={item.href}
        end={item.end}
        onClick={closeMobile}
        aria-label={compact ? item.label : undefined}
        className={sharedClassName}
      >
        <item.icon className={cn("h-5 w-5 flex-shrink-0", active && "text-primary", depth > 0 && "h-4 w-4")} />
        {!compact && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge ? (
              <span className={cn("flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] font-semibold px-1.5", badgeClasses(item.badgeTone))}>
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            ) : null}
          </>
        )}
        {compact && item.badge ? (
          <span className={cn("absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full text-[9px] font-semibold", badgeClasses(item.badgeTone))}>
            {item.badge > 9 ? "9+" : item.badge}
          </span>
        ) : null}
      </NavLink>
    );

    if (!compact) {
      return navItem;
    }

    return (
      <Tooltip key={keyHint ?? getItemKey(item, `leaf-${depth}`)}>
        <TooltipTrigger asChild>{navItem}</TooltipTrigger>
        <TooltipContent side="right" align="center">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  };

  const renderItem = (item: SidebarNavItem, sectionId: string, forceExpanded = false) => {
    if (!item.children?.length) {
      return renderLeafItem(item, 0, forceExpanded, getItemKey(item, `${sectionId}-leaf`));
    }

    const key = getItemKey(item, sectionId);
    const active = isItemActive(item);
    const open = openGroups[key] ?? false;
    const compact = collapsed && !forceExpanded;

    if (compact) {
      const firstChildHref = item.children.find((child) => child.href)?.href;
      if (!firstChildHref) return null;

      const navItem = (
        <NavLink
          key={key}
          href={firstChildHref}
          onClick={closeMobile}
          aria-label={item.label}
          className={cn(
            "relative flex items-center justify-center px-2 rounded-lg text-sm font-medium transition-colors",
            "hover:bg-muted hover:text-foreground",
            active ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground",
            navItemPaddingY,
          )}
        >
          <item.icon className={cn("h-5 w-5", active && "text-primary")} />
        </NavLink>
      );

      return (
        <Tooltip key={key}>
          <TooltipTrigger asChild>{navItem}</TooltipTrigger>
          <TooltipContent side="right" align="center">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Collapsible key={key} open={open} onOpenChange={(next) => setOpenGroups((prev) => ({ ...prev, [key]: next }))}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center gap-3 px-3 rounded-lg text-sm font-medium transition-colors",
              "hover:bg-muted hover:text-foreground",
              active ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground",
              navItemPaddingY,
            )}
          >
            <item.icon className={cn("h-5 w-5 flex-shrink-0", active && "text-primary")} />
            <span className="flex-1 text-left truncate">{item.label}</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1 ml-3 pl-3 border-l border-border/50 space-y-1">
          {item.children.map((child, index) =>
            renderLeafItem(child, 1, forceExpanded, getItemKey(child, `${key}-${index}`))
          )}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const renderFooter = (forceExpanded = false) => {
    const compact = collapsed && !forceExpanded;
    if (!footerText && (!footerSections || footerSections.length === 0)) return null;

    return (
      <div className="border-t border-border p-4 space-y-3">
        {!compact && footerText ? <p className="text-xs text-muted-foreground text-center">{footerText}</p> : null}
        {footerSections?.map((section) => (
          <div key={section.id} className="space-y-1">
            {!compact && section.title ? <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/80 px-2">{section.title}</p> : null}
            {section.items.map((item) => {
              const ItemIcon = item.icon;
              const isExternalHref = Boolean(item.href && /^(https?:\/\/|mailto:|tel:)/i.test(item.href));
              const shouldOpenInNewTab = Boolean(item.openInNewTab || isExternalHref);
              const content = (
                <div
                  className={cn(
                "relative flex items-center gap-2 px-2 rounded-md text-xs text-muted-foreground transition-colors",
                "hover:bg-muted hover:text-foreground",
                footerItemPaddingY,
                compact && "justify-center px-1",
              )}
            >
                  {ItemIcon ? <ItemIcon className="h-3.5 w-3.5" /> : null}
                  {!compact ? <span className="flex-1 truncate">{item.label}</span> : null}
                  {!compact && item.badge ? (
                    <span className={cn("flex h-4 min-w-4 items-center justify-center rounded-full text-[9px] font-semibold px-1", badgeClasses(item.badgeTone))}>
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  ) : null}
                </div>
              );

              if (item.href) {
                const navItem = shouldOpenInNewTab ? (
                  <a
                    key={item.id}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMobile}
                    aria-label={compact ? item.label : undefined}
                  >
                    {content}
                  </a>
                ) : (
                  <NavLink key={item.id} href={item.href} onClick={closeMobile} aria-label={compact ? item.label : undefined}>
                    {content}
                  </NavLink>
                );

                if (!compact) {
                  return navItem;
                }

                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                    <TooltipContent side="right" align="center">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              if (!compact) {
                return <div key={item.id}>{content}</div>;
              }

              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <div aria-label={item.label}>{content}</div>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const SidebarContent = ({ forceExpanded = false }: { forceExpanded?: boolean }) => (
    <div className="flex flex-col h-full">
      {showHeader ? (
        <div className={cn("flex items-center border-b border-border/70 px-3 h-14", (collapsed && !forceExpanded) ? "justify-center" : "justify-between")}>
          {logo}
          {!(collapsed && !forceExpanded) ? (
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={onToggle}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          ) : null}
        </div>
      ) : null}

      <ScrollArea className={cn("flex-1", scrollPaddingYClass)}>
        <nav className={cn("flex flex-col px-2", navContainerGapClass)}>
          {sections.map((section) => (
            <div key={section.id} className={sectionGapClass}>
              {section.dividerTop ? <div className="my-2 mx-2 border-t border-border/70" /> : null}
              {section.title && !(collapsed && !forceExpanded) ? (
                <p className="px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">{section.title}</p>
              ) : null}
              {section.items.map((item) => renderItem(item, section.id, forceExpanded))}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {renderFooter(forceExpanded)}
    </div>
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={cn("lg:hidden fixed top-4 left-4 z-50 bg-card border border-border", mobileToggleClassName)}
        onClick={() => setMobileOpen((prev) => !prev)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {mobileOpen ? (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={closeMobile}
        />
      ) : null}

      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-64 glass-sidebar border-r border-white/10 transform transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          className,
        )}
      >
        <SidebarContent forceExpanded />
      </aside>

      <aside
        className={cn(
          "hidden lg:sticky lg:top-0 lg:h-screen lg:flex flex-col glass-sidebar border-r border-white/10 transition-all duration-300",
          collapsed ? desktopCollapsedWidthClass : desktopExpandedWidthClass,
          className,
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
