"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import Maintenance from "@/legacy-pages/Maintenance";
import { createAppQueryClient } from "@/lib/react-query";

export default function MaintenancePage() {
  const [queryClient] = useState(() => createAppQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Maintenance />
    </QueryClientProvider>
  );
}
