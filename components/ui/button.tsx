import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7A35A]/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "glass-button bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]",
        primary: "button--primary shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm active:scale-[0.98]",
        outline: "button--outline bg-transparent border border-border/60 hover:border-[#C7A35A]/40 hover:bg-[#C7A35A]/5 active:scale-[0.98]",
        secondary: "button--secondary shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]",
        ghost: "hover:bg-white/10 hover:backdrop-blur-xl hover:text-foreground active:bg-white/15 [&_svg]:hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "glass-button bg-gradient-to-r from-[#C7A35A] to-[#D4AF37] text-black font-semibold tracking-wide shadow-lg hover:shadow-xl hover:scale-[1.02] hover:brightness-105 active:scale-[0.98] transition-all duration-200",
        heroOutline: "glass-button-outline border border-white/30 text-white bg-white/5 backdrop-blur-xl hover:bg-white/15 hover:border-white/50 hover:text-white hover:shadow-lg active:bg-white/20 font-semibold tracking-wide transition-all duration-200",
        luxury: "glass-button-subtle bg-card/60 backdrop-blur-xl border border-white/20 text-foreground hover:border-[#C7A35A]/40 hover:bg-card/80 hover:shadow-md active:scale-[0.98] transition-all duration-200",
        gold: "glass-button bg-gradient-to-r from-[#C7A35A] to-[#D4AF37] text-black font-semibold hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] shadow-md transition-all duration-200",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg px-4",
        lg: "h-11 rounded-lg px-8",
        xl: "h-14 rounded-xl px-10 text-base",
        icon: "h-10 w-10 rounded-lg",
        "icon-sm": "h-8 w-8 rounded-lg",
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
