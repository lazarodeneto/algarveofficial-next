"use client";

import type { ReactNode } from "react";

import { FavoritesSyncProvider } from "@/components/FavoritesSyncProvider";
import { MaintenanceGuard } from "@/components/MaintenanceGuard";
import { ChatProvider } from "@/components/chat/ChatProvider";
import { InboxRealtimeProvider } from "@/components/chat/InboxRealtimeProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";

export function UserEngagementProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <FavoritesSyncProvider>
        <InboxRealtimeProvider>
          <ChatProvider>
            <Toaster />
            <Sonner />
            <MaintenanceGuard>{children}</MaintenanceGuard>
          </ChatProvider>
        </InboxRealtimeProvider>
      </FavoritesSyncProvider>
    </AuthProvider>
  );
}
