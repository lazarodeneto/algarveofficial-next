"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type RevealState = "idle" | "visible";
type RevealDirection = "up" | "left" | "right";

const DEFAULT_DURATION_MS = 560;
const DEFAULT_DISTANCE_PX = 18;
const DEFAULT_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

interface SoftRevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delayMs?: number;
  disabled?: boolean;
  distance?: number;
  durationMs?: number;
  direction?: RevealDirection;
  rootMargin?: string;
  style?: CSSProperties;
}

function getIdleTransform(direction: RevealDirection, distance: number) {
  if (direction === "left") return `translate3d(${-distance}px, 0, 0)`;
  if (direction === "right") return `translate3d(${distance}px, 0, 0)`;
  return `translate3d(0, ${distance}px, 0)`;
}

function isAlreadyVisible(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

  return (
    rect.top < viewportHeight * 0.92 &&
    rect.bottom > 0 &&
    rect.left < viewportWidth &&
    rect.right > 0
  );
}

export function SoftReveal({
  as: Component = "div",
  children,
  className,
  delayMs = 0,
  disabled = false,
  distance = DEFAULT_DISTANCE_PX,
  durationMs = DEFAULT_DURATION_MS,
  direction = "up",
  rootMargin = "0px 0px -12% 0px",
  style,
}: SoftRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [revealState, setRevealState] = useState<RevealState>("visible");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || disabled) {
      setRevealState("visible");
      return undefined;
    }

    const motionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const prefersReducedMotion = Boolean(motionQuery?.matches);
    setReducedMotion(prefersReducedMotion);

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      setRevealState("visible");
      return undefined;
    }

    if (isAlreadyVisible(element)) {
      setRevealState("visible");
      return undefined;
    }

    setRevealState("idle");

    let isDisposed = false;
    let animationFrame: number | null = null;
    let observer: IntersectionObserver | null = null;

    const reveal = () => {
      if (isDisposed) return;
      setRevealState("visible");
      observer?.disconnect();
      window.removeEventListener("scroll", scheduleVisibilityCheck);
      window.removeEventListener("resize", scheduleVisibilityCheck);
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    };

    const checkVisibility = () => {
      animationFrame = null;
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      if (rect.top < viewportHeight * 0.92) {
        reveal();
      }
    };

    function scheduleVisibilityCheck() {
      if (animationFrame !== null) return;
      animationFrame = window.requestAnimationFrame(checkVisibility);
    }

    observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        reveal();
      },
      {
        rootMargin,
        threshold: 0.08,
      },
    );

    observer.observe(element);
    window.addEventListener("scroll", scheduleVisibilityCheck, { passive: true });
    window.addEventListener("resize", scheduleVisibilityCheck);
    scheduleVisibilityCheck();

    const handleMotionChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
      if (event.matches) {
        reveal();
      }
    };

    motionQuery?.addEventListener?.("change", handleMotionChange);

    return () => {
      isDisposed = true;
      observer?.disconnect();
      window.removeEventListener("scroll", scheduleVisibilityCheck);
      window.removeEventListener("resize", scheduleVisibilityCheck);
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
      motionQuery?.removeEventListener?.("change", handleMotionChange);
    };
  }, [disabled, rootMargin]);

  const isIdle = revealState === "idle" && !disabled && !reducedMotion;
  const revealStyle: CSSProperties = {
    opacity: isIdle ? 0 : 1,
    transform: isIdle ? getIdleTransform(direction, distance) : "translate3d(0, 0, 0)",
    transitionDelay: isIdle || reducedMotion ? "0ms" : `${delayMs}ms`,
    transitionDuration: reducedMotion || disabled ? "0ms" : `${durationMs}ms`,
    transitionProperty: reducedMotion || disabled ? "none" : "opacity, transform",
    transitionTimingFunction: DEFAULT_EASING,
    ...style,
  };

  return (
    <Component
      ref={ref}
      className={cn(
        "motion-reduce:transition-none",
        isIdle ? "will-change-[opacity,transform]" : null,
        className,
      )}
      data-soft-reveal={revealState}
      data-reduced-motion={reducedMotion ? "true" : undefined}
      style={revealStyle}
    >
      {children}
    </Component>
  );
}
