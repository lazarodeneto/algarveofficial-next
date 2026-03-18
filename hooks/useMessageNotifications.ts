"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type NotificationPermissionState = "default" | "granted" | "denied";

interface UseMessageNotificationsOptions {
  enabled?: boolean;
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: {
    threadId?: string;
    url?: string;
  };
}

/**
 * Hook for browser push notifications.
 * Realtime subscription is handled by InboxRealtimeProvider.
 * This hook only handles permission and showing notifications.
 */
export function useMessageNotifications(options: UseMessageNotificationsOptions = {}) {
  const { enabled = true } = options;
  const { user } = useAuth();

  const [permission, setPermission] = useState<NotificationPermissionState>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const supported = typeof window !== "undefined" && "Notification" in window;
    setIsSupported(supported);
    if (supported) setPermission(Notification.permission as NotificationPermissionState);
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermissionState);
      return result === "granted";
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      return false;
    }
  }, [isSupported]);

  const showNotification = useCallback(
    async (payload: NotificationPayload) => {
      if (!isSupported || permission !== "granted") return;

      try {
          const notification = new Notification(payload.title, {
            body: payload.body,
            icon: payload.icon || "/icons/icon-192x192.png",
            tag: payload.tag || "message-notification",
          });

          notification.onclick = () => {
            window.focus();
            const url = payload.data?.url;
            if (url && url.startsWith("/")) window.location.href = url;
            notification.close();
          };
      } catch (error) {
        console.error("Failed to show notification:", error);
      }
    },
    [isSupported, permission]
  );

  // URL by role
  const getMessagesUrl = useCallback(() => {
    if (!user) return "/dashboard/messages";
    const role = (user as any)?.role;

    switch (role) {
      case "admin":
      case "editor":
        return "/admin/messages";
      case "owner":
        return "/owner/messages";
      default:
        return "/dashboard/messages";
    }
  }, [user]);

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    getMessagesUrl,
  };
}
