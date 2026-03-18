"use client";

import dynamic from "next/dynamic";

import type { CityDetailClientProps } from "./CityDetailClient";

const CityDetailClient = dynamic(
  () => import("./CityDetailClient").then((mod) => mod.CityDetailClient),
  { ssr: false },
);

export function CityDetailHydrator(props: CityDetailClientProps) {
  return <CityDetailClient {...props} />;
}
