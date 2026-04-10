import type { ReactNode } from "react";

interface RootProvidersProps {
  children: ReactNode;
}

export function RootProviders({ children }: RootProvidersProps) {
  return <>{children}</>;
}
