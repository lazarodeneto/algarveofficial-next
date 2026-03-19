import { NavLink as RouterNavLink } from "@/components/router/nextRouterCompat";
import { forwardRef, type MouseEventHandler, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps {
  to: string;
  end?: boolean;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  target?: string;
  rel?: string;
  "aria-label"?: string;
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        href={to}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
