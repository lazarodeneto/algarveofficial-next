"use client";

import dynamic from "next/dynamic";

import type { DestinationDetailClientProps } from "./DestinationDetailClient";

const DestinationDetailClient = dynamic(
  () => import("./DestinationDetailClient").then((mod) => mod.DestinationDetailClient),
  { ssr: false },
);

export function DestinationDetailHydrator(props: DestinationDetailClientProps) {
  return <DestinationDetailClient {...props} />;
}
