"use client";

import { useEffect, useRef, useState } from "react";

type WidgetStatus = "loading" | "ready" | "error";

interface TravelPayoutsFlightsWidgetProps {
  label: string;
  scriptSrc: string;
}

export default function TravelPayoutsFlightsWidget({
  label,
  scriptSrc,
}: TravelPayoutsFlightsWidgetProps) {
  const widgetRootRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<WidgetStatus>("loading");

  useEffect(() => {
    const widgetRoot = widgetRootRef.current;

    if (!widgetRoot) {
      return;
    }

    setStatus("loading");
    widgetRoot.replaceChildren();

    const script = document.createElement("script");
    script.async = true;
    script.src = scriptSrc;
    script.charset = "utf-8";
    script.onload = () => setStatus("ready");
    script.onerror = () => setStatus("error");

    widgetRoot.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
      widgetRoot.replaceChildren();
    };
  }, [scriptSrc]);

  return (
    <div className="overflow-hidden rounded-lg border border-border/70 bg-card p-2 shadow-sm">
      <div
        ref={widgetRootRef}
        aria-label={label}
        className="min-h-[96px] [&>*]:max-w-full"
      />
      {status === "error" ? (
        <p className="px-4 py-3 text-sm text-muted-foreground">
          Flight search could not be loaded right now.
        </p>
      ) : null}
    </div>
  );
}
