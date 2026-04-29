"use client";

import { useEffect, useState } from "react";

export type BrightnessLevel = "dark" | "medium" | "light";

const SAMPLE_SIZE = 20;
const brightnessCache = new Map<string, BrightnessLevel>();

export function getOverlay(level: BrightnessLevel) {
  switch (level) {
    case "dark":
      return "from-black/70 via-black/30";
    case "medium":
      return "from-black/80 via-black/40";
    case "light":
      return "from-black/90 via-black/60";
  }
}

function toBrightnessLevel(value: number): BrightnessLevel {
  if (value < 85) return "dark";
  if (value < 170) return "medium";
  return "light";
}

export function useImageBrightness(src?: string | null): BrightnessLevel {
  const [level, setLevel] = useState<BrightnessLevel>(() => {
    if (!src || typeof window === "undefined") return "medium";
    return brightnessCache.get(src) ?? "medium";
  });

  useEffect(() => {
    if (!src || typeof window === "undefined") {
      setLevel("medium");
      return;
    }

    const cached = brightnessCache.get(src);
    if (cached) {
      setLevel(cached);
      return;
    }

    let cancelled = false;
    const image = new window.Image();

    image.crossOrigin = "anonymous";
    image.decoding = "async";

    image.onload = () => {
      if (cancelled) return;

      try {
        const canvas = document.createElement("canvas");
        canvas.width = SAMPLE_SIZE;
        canvas.height = SAMPLE_SIZE;

        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) throw new Error("Canvas context unavailable");

        context.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

        const { data } = context.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
        let total = 0;
        let count = 0;

        for (let index = 0; index < data.length; index += 4) {
          const alpha = data[index + 3];
          if (alpha === 0) continue;

          total += (data[index] * 299 + data[index + 1] * 587 + data[index + 2] * 114) / 1000;
          count += 1;
        }

        const nextLevel = count > 0 ? toBrightnessLevel(total / count) : "light";
        brightnessCache.set(src, nextLevel);
        setLevel(nextLevel);
      } catch {
        brightnessCache.set(src, "light");
        setLevel("light");
      }
    };

    image.onerror = () => {
      if (cancelled) return;
      brightnessCache.set(src, "light");
      setLevel("light");
    };

    image.src = src;

    return () => {
      cancelled = true;
    };
  }, [src]);

  return level;
}
