"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type MapSyncContextValue = {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
};

const MapSyncContext = createContext<MapSyncContextValue | null>(null);

export function MapSyncProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const value = useMemo(() => ({ activeId, setActiveId }), [activeId]);

  return <MapSyncContext.Provider value={value}>{children}</MapSyncContext.Provider>;
}

export function useMapSync() {
  const context = useContext(MapSyncContext);

  if (!context) {
    throw new Error("useMapSync must be used within MapSyncProvider");
  }

  return context;
}

export function useOptionalMapSync() {
  return useContext(MapSyncContext);
}
