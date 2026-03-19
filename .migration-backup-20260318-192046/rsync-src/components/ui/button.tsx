"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        // Default now uses liquidy glass with shimmer
        default: "glass-button bg-primary text-primary-foreground hover:bg-primary/90",
        primary: "button--primary shadow-sm",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        // Outline with liquidy glass shimmer
        outline: "button--outline bg-transparent",
        secondary: "button--secondary shadow-sm",
        ghost: "hover:bg-white/10 hover:backdrop-blur-xl hover:text-foreground [&_svg]:hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Luxury variants with liquidy glass effect
        hero: "glass-button bg-gradient-to-r from-[hsl(43,74%,49%)] to-[hsl(43,80%,35%)] text-black font-semibold tracking-wide shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
        heroOutline: "glass-button-outline border border-white/30 text-white bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/50 hover:text-white font-semibold tracking-wide",
        luxury: "glass-button-subtle bg-card/60 backdrop-blur-xl border border-white/20 text-foreground hover:border-primary/50 hover:bg-card/80",
        gold: "glass-button bg-gradient-to-r from-[hsl(43,74%,49%)] to-[hsl(43,80%,35%)] text-black font-semibold hover:brightness-110 shadow-md",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
