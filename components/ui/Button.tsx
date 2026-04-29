import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full text-sm font-semibold tracking-normal ring-offset-background transition-all duration-200 ease-out shadow-button [backface-visibility:hidden] hover:-translate-y-0.5 hover:brightness-105 hover:shadow-button-hover active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A62A]/55 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* ── Core variants ──────────────────────────────── */
        primary: "bg-gradient-gold text-black",
        secondary: "border border-border/70 bg-background text-foreground shadow-[0_10px_28px_-22px_rgba(0,0,0,0.5)] hover:border-[#D4A62A]/50 hover:bg-[#D4A62A]/8",
        ghost: "bg-transparent text-foreground shadow-none hover:bg-foreground/5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]",
        link: "rounded-none bg-transparent p-0 text-primary shadow-none underline-offset-4 hover:translate-y-0 hover:scale-100 hover:bg-transparent hover:shadow-none hover:underline active:translate-y-0 active:scale-100",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",

        /* ── Backward-compatible aliases (deprecated, mapped to core) ── */
        default: "bg-gradient-gold text-black",
        gold: "bg-gradient-gold text-black",
        hero: "bg-gradient-gold text-black",
        outline: "border border-border/70 bg-background text-foreground shadow-[0_10px_28px_-22px_rgba(0,0,0,0.5)] hover:border-[#D4A62A]/50 hover:bg-[#D4A62A]/8",
        heroOutline: "border border-white/45 bg-white/12 text-white backdrop-blur-md hover:bg-white/18",
        premium: "border border-border/70 bg-background text-foreground hover:border-[#D4A62A]/50 hover:bg-[#D4A62A]/8",
      },
      size: {
        default: "min-h-12 px-6 py-3",
        sm: "min-h-9 px-4 py-2 text-xs",
        lg: "min-h-[3.25rem] px-8 py-3.5 text-base",
        xl: "min-h-[3.75rem] px-10 py-4 text-base",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  "aria-label"?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
