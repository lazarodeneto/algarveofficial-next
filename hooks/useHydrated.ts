import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Hydration-safe client flag:
 * - `false` for SSR snapshot
 * - `true` after hydration on the client
 */
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
